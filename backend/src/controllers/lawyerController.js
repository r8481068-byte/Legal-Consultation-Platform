
const {
  createLawyerProfileService,
  getMyLawyerProfileService,
  updateLawyerProfileService,
  searchLawyersService,
  getPendingLawyersService,
  verifyLawyerService,
  getLawyerByIdService,
  applyAsLawyerService // new import
} = require("../services/lawyerService");

const searchLawyers = async (req, res, next) => {
  try {
    const result = await searchLawyersService(req.query);

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};



const createLawyerProfile = async (req, res, next) => {
  try {
    const lawyer = await createLawyerProfileService(
      req.user.userId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Lawyer profile created successfully",
      lawyer
    });
  } catch (error) {
    next(error);
  }
};

const getMyLawyerProfile = async (req, res, next) => {
  try {
    const lawyer = await getMyLawyerProfileService(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      lawyer
    });
  } catch (error) {
    next(error);
  }
};

const updateLawyerProfile = async (req, res, next) => {
  try {
    const lawyer = await updateLawyerProfileService(
      req.user.userId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Lawyer profile updated successfully",
      lawyer
    });
  } catch (error) {
    next(error);
  }
};


const getPendingLawyers = async (req, res, next) => {
  try {
    const lawyers = await getPendingLawyersService();

    return res.status(200).json({
      success: true,
      count: lawyers.length,
      lawyers
    });
  } catch (error) {
    next(error);
  }
};

const verifyLawyer = async (req, res, next) => {
  try {
    const adminUserId = req.user?.userId || req.user?.id || req.user?._id;
    const lawyer = await verifyLawyerService(
      req.params.lawyerId,
      req.body.status,
      req.body.decisionReason,
      adminUserId
    );

    return res.status(200).json({
      success: true,
      message: `Lawyer profile ${lawyer.verificationStatus}`,
      lawyer
    });
  } catch (error) {
    next(error);
  }
};

const getLawyerById = async (req, res, next) => {
  try {
    const lawyer = await getLawyerByIdService(
      req.params.lawyerId,
      req.user?.userId
    );

    return res.status(200).json({
      success: true,
      lawyer,
    });
  } catch (error) {
    next(error);
  }
};

const applyAsLawyer = async (req, res, next) => {
  try {
    const lawyer = await applyAsLawyerService(
      req.user.userId || req.user.id || req.user._id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Lawyer application submitted successfully",
      lawyer
    });
  } catch (error) {
    next(error);
  }
};

const getMyLawyerApplication = async (req, res, next) => {
  try {
    const { getMyLawyerApplicationService } = require("../services/lawyerService");
    const lawyer = await getMyLawyerApplicationService(
      req.user.userId || req.user.id || req.user._id
    );

    return res.status(200).json({
      success: true,
      application: lawyer || null
    });
  } catch (error) {
    next(error);
  }
};

const getMyEarnings = async (req, res, next) => {
  try {
    const { getLawyerEarningsService } = require("../services/lawyerService");
    const earnings = await getLawyerEarningsService(req.user.userId);
    return res.status(200).json({
      success: true,
      ...earnings
    });
  } catch (error) {
    next(error);
  }
};

const getAuthorizedClientDetail = async (req, res, next) => {
  try {
    const { getAuthorizedClientDetailService } = require("../services/lawyerService");
    const result = await getAuthorizedClientDetailService(
      req.user.userId,
      req.params.clientId
    );
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLawyerProfile,
  getMyLawyerProfile,
  updateLawyerProfile,
  searchLawyers,
  getPendingLawyers,
  verifyLawyer,
  getLawyerById,
  applyAsLawyer,
  getMyLawyerApplication,
  getMyEarnings,
  getAuthorizedClientDetail
};

 