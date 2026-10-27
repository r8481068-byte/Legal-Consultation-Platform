
const Lawyer = require("../models/Lawyer");
const User = require("../models/User");

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
    .populate("user", "name email");

  if (!lawyer) {
    const error = new Error("Lawyer profile not found");
    error.statusCode = 404;
    throw error;
  }

  return lawyer;
};

const updateLawyerProfileService = async (userId, data) => {
  const allowedFields = [
    "bio",
    "specialization",
    "experienceYears",
    "education",
    "consultationFee",
    "languages",
    "city",
    "isAvailable"
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  }

  const lawyer = await Lawyer.findOneAndUpdate(
    { user: userId },
    { $set: updates },
    {
      new: true,
      runValidators: true
    }
  ).populate("user", "name email");

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

  if (query.city && query.city !== "All Cities") {
    filter.city = {
      $regex: query.city,
      $options: "i"
    };
  }

  if (query.specialization && query.specialization !== "All Practice Areas") {
    filter.specialization = {
      $regex: query.specialization,
      $options: "i"
    };
  }

  if (query.courtLevel && query.courtLevel !== "All Courts") {
    filter.courtLevels = {
      $regex: query.courtLevel,
      $options: "i"
    };
  }

  if (query.state && query.state !== "All States") {
    filter.stateOfEnrolment = {
      $regex: query.state,
      $options: "i"
    };
  }

  if (query.minExperience) {
    const minExp = Number(query.minExperience);
    if (Number.isFinite(minExp) && minExp >= 0) {
      filter.experienceYears = { $gte: minExp };
    }
  }

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

  if (query.search && query.search.trim()) {
    const term = query.search.trim();
    const matchingUsers = await User.find({
      name: { $regex: term, $options: "i" }
    }).select("_id").lean();
    const userIds = matchingUsers.map((u) => u._id);

    filter.$or = [
      { user: { $in: userIds } },
      { city: { $regex: term, $options: "i" } },
      { specialization: { $regex: term, $options: "i" } },
      { bio: { $regex: term, $options: "i" } }
    ];
  }

  const skip = (page - 1) * limit;

  const [lawyers, total] = await Promise.all([
    Lawyer.find(filter)
      .select("-barCouncilId -__v")
      .populate("user", "name profileImage")
      .sort({ consultationFee: 1, _id: 1 })
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

const getLawyerByIdService = async (lawyerId) => {
  const lawyer = await Lawyer.findOne({
    _id: lawyerId,
    verificationStatus: "approved",
    isAvailable: true,
  })
    .select("-barCouncilId -__v")
    .populate("user", "name profileImage")
    .lean();

  if (!lawyer) {
    const error = new Error("Available lawyer not found");
    error.statusCode = 404;
    throw error;
  }

  return lawyer;
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
  getLawyerEarningsService
};

