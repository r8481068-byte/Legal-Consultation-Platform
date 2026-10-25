const {
  createReviewService,
  getMyReviewsService,
  getLawyerReviewsService,
  getAppointmentReviewStatusService,
  adminGetReviewsService,
  adminModerateReviewService
} = require("../services/reviewService");

const createReview = async (req, res, next) => {
  try {
    const review = await createReviewService(req.user.userId, req.body);
    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review
    });
  } catch (error) {
    next(error);
  }
};

const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await getMyReviewsService(req.user.userId);
    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

const getLawyerReviews = async (req, res, next) => {
  try {
    const result = await getLawyerReviewsService(req.params.lawyerId, req.query);
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const getAppointmentReviewStatus = async (req, res, next) => {
  try {
    const statusData = await getAppointmentReviewStatusService(
      req.user.userId,
      req.params.appointmentId
    );
    return res.status(200).json({
      success: true,
      ...statusData
    });
  } catch (error) {
    next(error);
  }
};

const adminGetReviews = async (req, res, next) => {
  try {
    const result = await adminGetReviewsService(req.query);
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const adminModerateReview = async (req, res, next) => {
  try {
    const review = await adminModerateReviewService(
      req.user.userId,
      req.params.reviewId,
      req.body
    );
    return res.status(200).json({
      success: true,
      message: `Review marked as ${review.status}`,
      review
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getMyReviews,
  getLawyerReviews,
  getAppointmentReviewStatus,
  adminGetReviews,
  adminModerateReview
};
