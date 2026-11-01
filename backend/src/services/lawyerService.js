
const Lawyer = require("../models/Lawyer");
const User = require("../models/User");
const Appointment = require("../models/Appointment");

const createLawyerProfileService = async (userId, data) => {
  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    const error = new Error("Active user account not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== "lawyer") {
    const error = new Error("Only lawyer accounts can create lawyer profiles");
    error.statusCode = 403;
    throw error;
  }

  const existingProfile = await Lawyer.findOne({ user: userId });

  if (existingProfile) {
    const error = new Error("Lawyer profile already exists");
    error.statusCode = 409;
    throw error;
  }

  const lawyer = await Lawyer.create({
    ...data,
    user: userId,
    verificationStatus: "pending"
  });

  return lawyer;
};

const getMyLawyerProfileService = async (userId) => {
  const lawyer = await Lawyer.findOne({ user: userId })
    .populate("user", "name email phone profileImage");

  if (!lawyer) {
    const error = new Error("Lawyer profile not found");
    error.statusCode = 404;
    throw error;
  }

  return lawyer;
};

const updateLawyerProfileService = async (userId, data) => {
  // Sync name, phone, or profile image to User model if provided
  const userUpdates = {};
  if (data.name && typeof data.name === "string" && data.name.trim().length >= 2) {
    userUpdates.name = data.name.trim();
  }
  if (data.userPhone && typeof data.userPhone === "string") {
    userUpdates.phone = data.userPhone.trim();
  } else if (data.phone && typeof data.phone === "string") {
    userUpdates.phone = data.phone.trim();
  }
  if (data.profileImage && typeof data.profileImage === "string") {
    userUpdates.profileImage = data.profileImage.trim();
  }
  if (Object.keys(userUpdates).length > 0) {
    await User.findByIdAndUpdate(userId, { $set: userUpdates });
  }

  const allowedFields = [
    "headline",
    "designation",
    "bio",
    "describeUs",
    "specialization",
    "secondarySpecializations",
    "experienceYears",
    "education",
    "internships",
    "experiences",
    "consultationFee",
    "consultationDuration",
    "consultationModes",
    "languages",
    "city",
    "state",
    "officeAddress",
    "phone",
    "hidePhone",
    "courtLevels",
    "practiceCourts",
    "jurisdictions",
    "achievements",
    "awards",
    "website",
    "memberships",
    "publications",
    "isAvailable",
    "isDraft"
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  }

  // Sync describeUs and bio
  if (updates.describeUs !== undefined) {
    updates.describeUs = typeof updates.describeUs === "string" ? updates.describeUs.trim() : "";
    if (updates.bio === undefined) {
      updates.bio = updates.describeUs;
    }
  } else if (updates.bio !== undefined) {
    updates.describeUs = typeof updates.bio === "string" ? updates.bio.trim() : "";
  }

  // Normalize string fields if array was provided
  if (Array.isArray(updates.achievements)) {
    updates.achievements = updates.achievements.join("\n");
  }
  if (Array.isArray(updates.memberships)) {
    updates.memberships = updates.memberships.join("\n");
  }
  if (Array.isArray(updates.publications)) {
    updates.publications = updates.publications.join("\n");
  }

  // Normalize awards array
  if (Array.isArray(updates.awards)) {
    updates.awards = updates.awards.map((a) => ({
      name: a.name || "",
      organization: a.organization || "",
      year: Number(a.year) || null,
      description: a.description || ""
    })).filter((a) => a.name || a.organization || a.description);
  }

  // Normalize education items (accept institution or university)
  if (Array.isArray(updates.education)) {
    updates.education = updates.education.map((e) => ({
      ...e,
      institution: e.institution || e.university || ""
    }));
  }

  // Handle draft vs publish requests
  if (data.isDraft !== undefined) {
    updates.isDraft = Boolean(data.isDraft);
  }

  // Ensure lawyer cannot self-approve or alter verification records
  delete updates.verificationStatus;
  delete updates.decisionReason;
  delete updates.reviewedAt;
  delete updates.reviewedBy;

  const lawyer = await Lawyer.findOneAndUpdate(
    { user: userId },
    { $set: updates },
    {
      new: true,
      runValidators: true
    }
  ).populate("user", "name email phone profileImage");

  if (!lawyer) {
    const error = new Error("Lawyer profile not found");
    error.statusCode = 404;
    throw error;
  }

  return lawyer;
};


const searchLawyersService = async (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(query.limit, 10) || 10)
  );

  const filter = {
    verificationStatus: "approved",
    isAvailable: true
  };

  const andClauses = [];

  // Specialization filter
  if (query.specialization && query.specialization !== "All Practice Areas" && query.specialization !== "All Specializations") {
    filter.specialization = {
      $regex: query.specialization,
      $options: "i"
    };
  }

  // Court Level filter
  if (query.courtLevel && query.courtLevel !== "All Courts") {
    filter.courtLevels = {
      $regex: query.courtLevel,
      $options: "i"
    };
  }

  // State filter
  if (query.state && query.state !== "All States") {
    const stateTerm = query.state.trim();
    andClauses.push({
      $or: [
        { state: { $regex: stateTerm, $options: "i" } },
        { stateOfEnrolment: { $regex: stateTerm, $options: "i" } },
        { officeAddress: { $regex: stateTerm, $options: "i" } },
        { city: { $regex: stateTerm, $options: "i" } }
      ]
    });
  }

  // District filter
  const districtTerm = (query.district || "").trim();
  if (districtTerm && districtTerm !== "All Districts") {
    andClauses.push({
      $or: [
        { district: { $regex: districtTerm, $options: "i" } },
        { city: { $regex: districtTerm, $options: "i" } },
        { officeAddress: { $regex: districtTerm, $options: "i" } }
      ]
    });
  }

  // General Location filter (city or location query parameter)
  const locTerm = (query.location || query.city || "").trim();
  if (locTerm && locTerm !== "All Cities" && locTerm !== "All Locations") {
    andClauses.push({
      $or: [
        { city: { $regex: locTerm, $options: "i" } },
        { district: { $regex: locTerm, $options: "i" } },
        { state: { $regex: locTerm, $options: "i" } },
        { stateOfEnrolment: { $regex: locTerm, $options: "i" } },
        { officeAddress: { $regex: locTerm, $options: "i" } }
      ]
    });
  }

  // Verified lawyers only filter
  if (query.verifiedOnly === "true" || query.isVerified === "true") {
    filter.verificationStatus = "approved";
  }

  // Experience filter
  if (query.minExperience !== undefined && query.minExperience !== "") {
    const minExp = Number(query.minExperience);
    if (Number.isFinite(minExp) && minExp >= 0) {
      filter.experienceYears = { $gte: minExp };
    }
  }

  // Rating filter
  if (query.minRating !== undefined && query.minRating !== "") {
    const minRat = Number(query.minRating);
    if (Number.isFinite(minRat) && minRat >= 0) {
      filter.averageRating = { $gte: minRat };
    }
  } else if (query.rating !== undefined && query.rating !== "") {
    const minRat = Number(query.rating);
    if (Number.isFinite(minRat) && minRat >= 0) {
      filter.averageRating = { $gte: minRat };
    }
  }

  // Fee filter
  const minFee = Number(query.minFee);
  const maxFee = Number(query.maxFee);

  if (query.minFee !== undefined || query.maxFee !== undefined) {
    filter.consultationFee = {};

    if (query.minFee !== undefined && Number.isFinite(minFee) && minFee >= 0) {
      filter.consultationFee.$gte = minFee;
    }

    if (query.maxFee !== undefined && Number.isFinite(maxFee) && maxFee >= 0) {
      filter.consultationFee.$lte = maxFee;
    }

    if (Object.keys(filter.consultationFee).length === 0) {
      delete filter.consultationFee;
    }
  }

  // Search by lawyer name specifically
  if (query.name && query.name.trim()) {
    const nameTerm = query.name.trim();
    const matchingUsers = await User.find({
      name: { $regex: nameTerm, $options: "i" }
    }).select("_id").lean();
    const userIds = matchingUsers.map((u) => u._id);
    filter.user = { $in: userIds };
  }

  // General text search (name, specialization, city, bio)
  if (query.search && query.search.trim()) {
    const term = query.search.trim();
    const matchingUsers = await User.find({
      name: { $regex: term, $options: "i" }
    }).select("_id").lean();
    const userIds = matchingUsers.map((u) => u._id);

    andClauses.push({
      $or: [
        { user: { $in: userIds } },
        { city: { $regex: term, $options: "i" } },
        { state: { $regex: term, $options: "i" } },
        { specialization: { $regex: term, $options: "i" } },
        { headline: { $regex: term, $options: "i" } },
        { bio: { $regex: term, $options: "i" } }
      ]
    });
  }

  if (andClauses.length > 0) {
    filter.$and = andClauses;
  }

  // Sorting
  let sortOption = { consultationFee: 1, _id: 1 };
  if (query.sortBy === "fee_asc") {
    sortOption = { consultationFee: 1, _id: 1 };
  } else if (query.sortBy === "fee_desc") {
    sortOption = { consultationFee: -1, _id: 1 };
  } else if (query.sortBy === "exp_desc" || query.sortBy === "experience_desc" || query.sortBy === "experience") {
    sortOption = { experienceYears: -1, _id: 1 };
  } else if (query.sortBy === "rating_desc" || query.sortBy === "rating") {
    sortOption = { averageRating: -1, totalReviews: -1, _id: 1 };
  }

  const skip = (page - 1) * limit;

  const [lawyers, total] = await Promise.all([
    Lawyer.find(filter)
      .select("-barCouncilId -__v")
      .populate("user", "name profileImage")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),

    Lawyer.countDocuments(filter)
  ]);

  return {
    lawyers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getPendingLawyersService = async () => {
  return Lawyer.find({
    verificationStatus: { $in: ["pending", "additional_info_required"] }
  })
    .populate("user", "name email phone profileImage")
    .sort({ createdAt: -1 })
    .lean();
};

const verifyLawyerService = async (lawyerId, status, decisionReason = "", adminUserId = null) => {
  if (!["approved", "rejected", "additional_info_required"].includes(status)) {
    const error = new Error(
      "Status must be approved, rejected, or additional_info_required"
    );
    error.statusCode = 400;
    throw error;
  }

  const lawyer = await Lawyer.findById(lawyerId);

  if (!lawyer) {
    const error = new Error("Lawyer profile not found");
    error.statusCode = 404;
    throw error;
  }

  const user = await User.findById(lawyer.user);

  if (!user || !user.isActive) {
    const error = new Error("Active applicant account not found");
    error.statusCode = 404;
    throw error;
  }

  lawyer.verificationStatus = status;
  lawyer.decisionReason = decisionReason || "";
  lawyer.reviewedAt = new Date();
  if (adminUserId) {
    lawyer.reviewedBy = adminUserId;
  }

  if (status === "approved") {
    user.role = "lawyer";
    lawyer.isAvailable = true;
    await user.save();
  } else {
    user.role = "client";
    lawyer.isAvailable = false;
    await user.save();
  }

  await lawyer.save();

  return lawyer;
};

const getLawyerByIdService = async (lawyerId, requesterUserId = null) => {
  const lawyer = await Lawyer.findById(lawyerId)
    .populate("user", "name profileImage email phone")
    .lean();

  if (!lawyer) {
    const error = new Error("Lawyer profile not found");
    error.statusCode = 404;
    throw error;
  }

  const isOwner =
    requesterUserId &&
    (lawyer.user?._id?.toString() === requesterUserId.toString() ||
      lawyer.user?.toString() === requesterUserId.toString());

  if (!isOwner && (lawyer.verificationStatus !== "approved" || !lawyer.isAvailable)) {
    const error = new Error("Available lawyer not found");
    error.statusCode = 404;
    throw error;
  }

  // Remove barCouncilId and private verification docs from public view
  if (!isOwner) {
    delete lawyer.barCouncilId;
    delete lawyer.verificationDocuments;
  }
  delete lawyer.__v;

  // Contact privacy: hide phone if lawyer configured it private
  if (lawyer.hidePhone && !isOwner) {
    delete lawyer.phone;
    if (lawyer.user) {
      delete lawyer.user.phone;
    }
  }

  return lawyer;
};

const getAuthorizedClientDetailService = async (lawyerUserId, clientId) => {
  const lawyer = await Lawyer.findOne({ user: lawyerUserId });
  if (!lawyer) {
    const error = new Error("Lawyer profile not found");
    error.statusCode = 404;
    throw error;
  }

  // Strictly enforce authorization on server: lawyer and client must have at least one appointment
  const appointments = await Appointment.find({
    lawyer: lawyer._id,
    client: clientId
  })
    .sort({ scheduledAt: -1 })
    .select("scheduledAt durationMinutes consultationType status notes meetingRoomId isPaid createdAt")
    .lean();

  if (!appointments || appointments.length === 0) {
    const error = new Error("You are not authorized to view this client profile");
    error.statusCode = 403;
    throw error;
  }

  const client = await User.findOne({
    _id: clientId,
    role: "client"
  })
    .select("name email phone profileImage cityVillage district state createdAt")
    .lean();

  if (!client) {
    const error = new Error("Client account not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    client,
    appointmentsCount: appointments.length,
    appointments
  };
};

const applyAsLawyerService = async (userId, data) => {
  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    const error = new Error("Active user account not found");
    error.statusCode = 404;
    throw error;
  }

  // Update user phone or profile image if submitted in personal step
  if (data.phone && data.phone.trim()) {
    user.phone = data.phone.trim();
  }
  if (data.profileImage && data.profileImage.trim()) {
    user.profileImage = data.profileImage.trim();
  }
  await user.save();

  const existingProfile = await Lawyer.findOne({ user: userId });

  if (existingProfile) {
    if (existingProfile.verificationStatus === "approved") {
      const error = new Error("Lawyer profile is already approved");
      error.statusCode = 409;
      throw error;
    }

    if (existingProfile.verificationStatus === "pending") {
      const error = new Error("Lawyer application is already submitted and pending review");
      error.statusCode = 409;
      throw error;
    }

    // If additional_info_required or rejected, allow applicant to correct and resubmit
    existingProfile.bio = data.bio || existingProfile.bio;
    existingProfile.specialization = data.specialization || existingProfile.specialization;
    existingProfile.experienceYears = Number(data.experienceYears) || existingProfile.experienceYears;
    existingProfile.education = data.education || existingProfile.education;
    existingProfile.barCouncilId = data.barCouncilId || existingProfile.barCouncilId;
    existingProfile.consultationFee = Number(data.consultationFee) || existingProfile.consultationFee;
    existingProfile.languages = data.languages || existingProfile.languages;
    existingProfile.city = data.city || existingProfile.city;
    existingProfile.stateOfEnrolment = data.stateOfEnrolment || existingProfile.stateOfEnrolment;
    existingProfile.lawCollege = data.lawCollege || existingProfile.lawCollege;
    existingProfile.graduationYear = Number(data.graduationYear) || existingProfile.graduationYear;
    existingProfile.consultationModes = data.consultationModes || existingProfile.consultationModes;
    if (data.verificationDocuments && data.verificationDocuments.length > 0) {
      existingProfile.verificationDocuments = data.verificationDocuments;
    }
    existingProfile.verificationStatus = "pending";
    existingProfile.decisionReason = "";
    existingProfile.isAvailable = false;

    await existingProfile.save();
    return existingProfile;
  }

  const lawyer = await Lawyer.create({
    bio: data.bio || "",
    specialization: data.specialization,
    experienceYears: Number(data.experienceYears) || 1,
    education: data.education || [],
    barCouncilId: data.barCouncilId,
    consultationFee: Number(data.consultationFee) || 500,
    languages: data.languages || ["English"],
    city: data.city,
    stateOfEnrolment: data.stateOfEnrolment || "",
    lawCollege: data.lawCollege || "",
    graduationYear: Number(data.graduationYear) || null,
    consultationModes: data.consultationModes || ["video", "in_person"],
    verificationDocuments: data.verificationDocuments || [],
    user: userId,
    verificationStatus: "pending",
    isAvailable: false
  });

  return lawyer;
};

const getMyLawyerApplicationService = async (userId) => {
  const lawyer = await Lawyer.findOne({ user: userId })
    .populate("user", "name email phone profileImage")
    .populate("reviewedBy", "name email")
    .lean();

  return lawyer;
};

const getLawyerEarningsService = async (userId) => {
  const lawyer = await Lawyer.findOne({ user: userId });
  if (!lawyer) {
    const error = new Error("Lawyer profile not found");
    error.statusCode = 404;
    throw error;
  }

  const Appointment = require("../models/Appointment");
  const Payment = require("../models/Payment");

  const completedAppointments = await Appointment.find({
    lawyer: lawyer._id,
    status: "completed"
  })
    .populate("client", "name")
    .sort({ scheduledAt: -1 })
    .lean();

  const appointmentIds = completedAppointments.map((a) => a._id);

  const capturedPayments = await Payment.find({
    appointment: { $in: appointmentIds },
    status: "captured"
  }).lean();

  const paymentMap = new Map();
  capturedPayments.forEach((p) => {
    paymentMap.set(p.appointment.toString(), p);
  });

  let grossPaise = 0;
  const transactions = completedAppointments.map((app) => {
    const payment = paymentMap.get(app._id.toString());
    const amountPaise = payment ? payment.amount : Math.round((lawyer.consultationFee || 0) * 100);
    if (payment) grossPaise += amountPaise;

    const amountRupees = Math.round(amountPaise / 100);
    const platformCut = Math.round(amountRupees * 0.1);
    const netPayout = amountRupees - platformCut;

    return {
      appointmentId: app._id,
      clientName: app.client?.name || "Client",
      consultationDate: app.scheduledAt,
      consultationType: app.consultationType,
      isPaid: !!payment,
      paidAt: payment?.paidAt || null,
      amountRupees,
      platformCut,
      netPayout,
      paymentId: payment?.razorpayPaymentId || null
    };
  });

  const grossRupees = Math.round(grossPaise / 100);
  const totalPlatformCharges = Math.round(grossRupees * 0.1);
  const totalNetEarnings = grossRupees - totalPlatformCharges;

  return {
    lawyer: {
      id: lawyer._id,
      consultationFee: lawyer.consultationFee,
      averageRating: lawyer.averageRating || 0,
      totalReviews: lawyer.totalReviews || 0
    },
    summary: {
      totalCompletedConsultations: completedAppointments.length,
      paidConsultationsCount: capturedPayments.length,
      grossEarningsRupees: grossRupees,
      platformChargesRupees: totalPlatformCharges,
      netEarningsRupees: totalNetEarnings
    },
    transactions
  };
};

const getDirectorySummaryService = async () => {
  const [counts, totalApproved] = await Promise.all([
    Lawyer.aggregate([
      {
        $match: {
          verificationStatus: "approved",
          isAvailable: true
        }
      },
      {
        $group: {
          _id: {
            $toLower: {
              $ifNull: ["$state", "$stateOfEnrolment"]
            }
          },
          count: { $sum: 1 },
          districts: { $addToSet: "$city" }
        }
      }
    ]),
    Lawyer.countDocuments({
      verificationStatus: "approved",
      isAvailable: true
    })
  ]);

  const stateCounts = {};
  counts.forEach((item) => {
    if (item._id && typeof item._id === "string" && item._id.trim()) {
      stateCounts[item._id.trim()] = item.count;
    }
  });

  return {
    stateCounts,
    totalLawyers: totalApproved
  };
};

module.exports = {
  createLawyerProfileService,
  getMyLawyerProfileService,
  updateLawyerProfileService,
  searchLawyersService,
  getPendingLawyersService,
  verifyLawyerService,
  getLawyerByIdService,
  applyAsLawyerService,
  getMyLawyerApplicationService,
  getLawyerEarningsService,
  getAuthorizedClientDetailService,
  getDirectorySummaryService
};

