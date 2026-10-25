const Review = require("../models/Review");
const Appointment = require("../models/Appointment");
const Lawyer = require("../models/Lawyer");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

/**
 * Recalculate and update lawyer average rating and total review count from approved reviews.
 */
const recalculateLawyerRating = async (lawyerId) => {
  const reviews = await Review.find({ lawyer: lawyerId, status: "approved" }).lean();
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
    : 0;

  await Lawyer.findByIdAndUpdate(lawyerId, {
    $set: { averageRating, totalReviews }
  });
};

const createReviewService = async (clientId, data) => {
  const { appointmentId, rating, reviewText, categories } = data;

  if (!mongoose.isValidObjectId(appointmentId)) {
    const error = new Error("Invalid appointment ID");
    error.statusCode = 400;
    throw error;
  }

  const numRating = Number(rating);
  if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
    const error = new Error("Rating must be an integer between 1 and 5");
    error.statusCode = 400;
    throw error;
  }

  const appointment = await Appointment.findById(appointmentId).populate("lawyer");
  if (!appointment) {
    const error = new Error("Appointment not found");
    error.statusCode = 404;
    throw error;
  }

  if (appointment.client.toString() !== clientId.toString()) {
    const error = new Error("You are not authorized to review this appointment");
    error.statusCode = 403;
    throw error;
  }

  if (appointment.status !== "completed") {
    const error = new Error(
      `Reviews can only be submitted for completed consultations. Current status: ${appointment.status}`
    );
    error.statusCode = 400;
    throw error;
  }

  // Prevent duplicate review
  const existingReview = await Review.findOne({ appointment: appointmentId });
  if (existingReview) {
    const error = new Error("A review has already been submitted for this consultation");
    error.statusCode = 409;
    throw error;
  }

  // Sanitize categories
  const cleanCategories = {};
  if (categories && typeof categories === "object") {
    ["communication", "professionalism", "clarity", "punctuality"].forEach((cat) => {
      const val = Number(categories[cat]);
      if (Number.isInteger(val) && val >= 1 && val <= 5) {
        cleanCategories[cat] = val;
      }
    });
  }

  const review = await Review.create({
    appointment: appointment._id,
    client: clientId,
    lawyer: appointment.lawyer._id,
    rating: numRating,
    reviewText: typeof reviewText === "string" ? reviewText.trim() : "",
    categories: cleanCategories,
    status: "approved"
  });

  appointment.isReviewed = true;
  await appointment.save();

  // Recalculate lawyer rating immediately
  await recalculateLawyerRating(appointment.lawyer._id);

  // Notify lawyer
  try {
    const lawyerUserId = appointment.lawyer.user;
    if (lawyerUserId) {
      await Notification.create({
        recipient: lawyerUserId,
        title: "New Client Review",
        message: `A client left a ${numRating}-star rating for your completed consultation.`,
        type: "review",
        link: "/lawyer-dashboard",
        relatedId: review._id
      });
    }
  } catch (err) {
    console.error("Failed to create review notification:", err.message);
  }

  return review;
};

const getMyReviewsService = async (clientId) => {
  return Review.find({ client: clientId })
    .populate({
      path: "lawyer",
      select: "city specialization consultationFee user",
      populate: {
        path: "user",
        select: "name profileImage"
      }
    })
    .sort({ createdAt: -1 })
    .lean();
};

const getLawyerReviewsService = async (lawyerId, query = {}) => {
  if (!mongoose.isValidObjectId(lawyerId)) {
    const error = new Error("Invalid lawyer ID");
    error.statusCode = 400;
    throw error;
  }

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const filter = { lawyer: lawyerId, status: "approved" };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("client", "name profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter)
  ]);

  return {
    reviews,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getAppointmentReviewStatusService = async (clientId, appointmentId) => {
  if (!mongoose.isValidObjectId(appointmentId)) {
    const error = new Error("Invalid appointment ID");
    error.statusCode = 400;
    throw error;
  }

  const appointment = await Appointment.findById(appointmentId).populate({
    path: "lawyer",
    select: "user city specialization",
    populate: { path: "user", select: "name profileImage" }
  });

  if (!appointment) {
    const error = new Error("Appointment not found");
    error.statusCode = 404;
    throw error;
  }

  if (appointment.client.toString() !== clientId.toString()) {
    const error = new Error("Unauthorized to access appointment review status");
    error.statusCode = 403;
    throw error;
  }

  const existingReview = await Review.findOne({ appointment: appointmentId });

  return {
    isEligible: appointment.status === "completed" && !existingReview,
    isReviewed: !!existingReview,
    status: appointment.status,
    review: existingReview || null,
    appointment
  };
};

const adminGetReviewsService = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 15));
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.status && ["approved", "hidden", "flagged"].includes(query.status)) {
    filter.status = query.status;
  }

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("client", "name email")
      .populate({
        path: "lawyer",
        select: "user city specialization",
        populate: { path: "user", select: "name email" }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter)
  ]);

  return {
    reviews,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const adminModerateReviewService = async (adminId, reviewId, { status, moderationReason }) => {
  if (!["approved", "hidden", "flagged"].includes(status)) {
    const error = new Error("Status must be approved, hidden, or flagged");
    error.statusCode = 400;
    throw error;
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  review.status = status;
  review.moderationReason = moderationReason || "";
  review.moderatedBy = adminId;
  review.moderatedAt = new Date();
  await review.save();

  // Recalculate lawyer rating whenever status changes
  await recalculateLawyerRating(review.lawyer);

  return review;
};

module.exports = {
  createReviewService,
  getMyReviewsService,
  getLawyerReviewsService,
  getAppointmentReviewStatusService,
  adminGetReviewsService,
  adminModerateReviewService,
  recalculateLawyerRating
};
