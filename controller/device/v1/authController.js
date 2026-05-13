/*
 * authController.js
 * @description :: exports authentication methods
 */

const User = require("../../../model/user");
const default_variable = require("../../../model/default_variable");
const dbService = require("../../../utils/dbService");
const userTokens = require("../../../model/userTokens");
const dayjs = require("dayjs");
const userSchemaKey = require("../../../utils/validation/userValidation");
const validation = require("../../../utils/validateRequest");
const authConstant = require("../../../constants/authConstant");
const authService = require("../../../services/auth");
const common = require("../../../utils/common");
const auth = require("../../../services/auth");
const {
  JWT,
  LOGIN_ACCESS,
  PLATFORM,
  MAX_LOGIN_RETRY_LIMIT,
  LOGIN_REACTIVE_TIME,
  FORGOT_PASSWORD_WITH,
} = require("../../../constants/authConstant");

/**
 * @description : user registration
 * @param {Object} req : request for register
 * @param {Object} res : response for register
 * @return {Object} : response for register {status, message, data}
 */
const register = async (req, res) => {
  try {
    let validateRequest = validation.validateParamsWithJoi(
      req.body,
      userSchemaKey.schemaKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({
        message: `Invalid values in parameters, ${validateRequest.message}`,
      });
    }
    let isEmptyPassword = false;
    if (!req.body.password) {
      isEmptyPassword = true;
      req.body.password = Math.random().toString(36).slice(2);
    }
    const data = new User({
      ...req.body,
    });

    let checkUniqueFields = await common.checkUniqueFieldsInDatabase(
      User,
      ["user_id"],
      data,
      "INSERT",
    );
    if (checkUniqueFields.isDuplicate) {
      return res.validationError({
        message: `${checkUniqueFields.value} already exists.Unique ${checkUniqueFields.field} are allowed.`,
      });
    }

    const result = await dbService.create(User, data);
    if (isEmptyPassword && req.body.email) {
      await authService.sendPasswordByEmail({
        email: req.body.email,
        password: req.body.password,
      });
    }
    if (isEmptyPassword && req.body.mobileNo) {
      await authService.sendPasswordBySMS({
        mobileNo: req.body.mobileNo,
        password: req.body.password,
      });
    }
    return res.success({ data: result });
  } catch (error) {
    return res.internalServerError({ data: error.message });
  }
};

/**
 * @description : login with username and password
 * @param {Object} req : request for login
 * @param {Object} res : response for login
 * @return {Object} : response for login {status, message, data}
 */
const login = async (req, res) => {
  try {
    let { username, password } = req.body;

    if (!username || !password) {
      return res.badRequest({
        message:
          "Insufficient request parameters! username and password is required.",
      });
    }
    let roleAccess = false;
    if (req.body.includeRoleAccess) {
      roleAccess = req.body.includeRoleAccess;
    }
    let result = await authService.loginUser(
      username,
      password,
      authConstant.PLATFORM.DEVICE,
      roleAccess,
    );
    if (result.flag) {
      return res.badRequest({ message: result.data });
    }
    return res.success({
      data: result.data,
      message: "Login Successful",
    });
  } catch (error) {
    return res.internalServerError({ data: error.message });
  }
};

/**
 * @description : send email or sms to user with OTP on forgot password
 * @param {Object} req : request for forgotPassword
 * @param {Object} res : response for forgotPassword
 * @return {Object} : response for forgotPassword {status, message, data}
 */
const forgotPassword = async (req, res) => {
  const params = req.body;
  try {
    if (!params.email) {
      return res.badRequest({
        message: "Insufficient request parameters! email is required.",
      });
    }
    let where = { email: params.email };
    where.isActive = true;
    where.isDeleted = false;
    params.email = params.email.toString().toLowerCase();
    let found = await dbService.findOne(User, where);
    if (!found) {
      return res.recordNotFound();
    }
    let { resultOfEmail, resultOfSMS } =
      await authService.sendResetPasswordNotification(found);
    if (resultOfEmail && resultOfSMS) {
      return res.success({ message: "otp successfully send." });
    } else if (resultOfEmail && !resultOfSMS) {
      return res.success({ message: "otp successfully send to your email." });
    } else if (!resultOfEmail && resultOfSMS) {
      return res.success({
        message: "otp successfully send to your mobile number.",
      });
    } else {
      return res.failure({
        message: "otp can not be sent due to some issue try again later",
      });
    }
  } catch (error) {
    return res.internalServerError({ data: error.message });
  }
};

/**
 * @description : validate OTP
 * @param {Object} req : request for validateResetPasswordOtp
 * @param {Object} res : response for validateResetPasswordOtp
 * @return {Object} : response for validateResetPasswordOtp  {status, message, data}
 */
const validateResetPasswordOtp = async (req, res) => {
  const params = req.body;
  try {
    if (!params.otp) {
      return res.badRequest({
        message: "Insufficient request parameters! otp is required.",
      });
    }
    const where = {
      "resetPasswordLink.code": params.otp,
      isActive: true,
      isDeleted: false,
    };
    let found = await dbService.findOne(User, where);
    if (!found || !found.resetPasswordLink.expireTime) {
      return res.failure({ message: "Invalid OTP" });
    }
    if (dayjs(new Date()).isAfter(dayjs(found.resetPasswordLink.expireTime))) {
      return res.failure({
        message: "Your reset password link is expired or invalid",
      });
    }
    await dbService.updateOne(User, found.id, { resetPasswordLink: {} });
    return res.success({ message: "OTP verified" });
  } catch (error) {
    return res.internalServerError({ data: error.message });
  }
};

/**
 * @description : reset password with code and new password
 * @param {Object} req : request for resetPassword
 * @param {Object} res : response for resetPassword
 * @return {Object} : response for resetPassword {status, message, data}
 */
const getUserIdsByGaushala = async (req, res) => {
  try {
    const GAUSHALA_ID = "01"; // fixed value (personal use)

    const users = await User.find(
      {
        gaushala_id: GAUSHALA_ID,
        isActive: true,
        isDeleted: false,
      },
      { user_id: 1, _id: 0 },
    );

    const userIds = users.map((u) => u.user_id);

    return res.success({
      message: "User IDs fetched successfully",
      data: userIds,
    });
  } catch (error) {
    console.error(error);
    return res.internalServerError({
      message: "Something went wrong",
    });
  }
};

const resetPassword = async (req, res) => {
  const params = req.body;
  try {
    if (!params.code || !params.newPassword) {
      return res.badRequest({
        message:
          "Insufficient request parameters! code and newPassword is required.",
      });
    }
    const where = {
      "resetPasswordLink.code": params.code,
      isActive: true,
      isDeleted: false,
    };
    let found = await dbService.findOne(User, where);
    if (!found || !found.resetPasswordLink.expireTime) {
      return res.failure({ message: "Invalid Code" });
    }
    if (dayjs(new Date()).isAfter(dayjs(found.resetPasswordLink.expireTime))) {
      return res.failure({
        message: "Your reset password link is expired or invalid",
      });
    }
    let response = await authService.resetPassword(found, params.newPassword);
    if (!response || response.flag) {
      return res.failure({ message: response.data });
    }
    return res.success({ message: response.data });
  } catch (error) {
    return res.internalServerError({ data: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!newPassword) {
      return res.failure({ message: "New password is required" });
    }

    const where = {
      user_id: userId,
    };

    const user = await dbService.findOne(User, where);

    if (!user) {
      return res.failure({ message: "User not found" });
    }

    if (user.isActive === false || user.isDeleted === true) {
      return res.failure({ message: "User is not active or has been deleted" });
    }

    // ✅ Just assign password
    user.password = newPassword;

    // ✅ This triggers pre('save') → bcrypt hash
    await user.save();

    return res.success({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    return res.internalServerError({ message: "Something went wrong" });
  }
};

const updateMultiplePasswords = async (req, res) => {
  try {
    const usersObject = req.body;

    if (!usersObject || typeof usersObject !== "object") {
      return res.failure({ message: "Invalid request body" });
    }

    const result = {
      updated: [],
      skipped: [],
      failed: [],
    };

    for (const [userId, newPassword] of Object.entries(usersObject)) {
      try {
        if (!newPassword) {
          result.skipped.push({
            userId,
            reason: "Password missing",
          });
          continue;
        }

        const user = await dbService.findOne(User, { user_id: userId });

        if (!user) {
          result.skipped.push({
            userId,
            reason: "User not found",
          });
          continue;
        }

        if (user.isActive === false || user.isDeleted === true) {
          result.skipped.push({
            userId,
            reason: "User inactive or deleted",
          });
          continue;
        }

        // ✅ Assign plain password (bcrypt via pre('save'))
        user.password = newPassword;
        await user.save();

        result.updated.push(userId);
      } catch (err) {
        console.error(`Error updating password for ${userId}`, err);
        result.failed.push({
          userId,
          reason: "Internal error",
        });
      }
    }

    return res.success({
      message: "Bulk password update completed",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.internalServerError({ message: "Something went wrong" });
  }
};

/**
 * @description : logout user
 * @param {Object} req : request for logout
 * @param {Object} res : response for logout
 * @return {Object} : response for logout {status, message, data}
 */
const logout = async (req, res) => {
  try {
    let userToken = await dbService.findOne(userTokens, {
      token: req.headers.authorization.replace("Bearer ", ""),
      userId: req.user.id,
    });
    let updatedDocument = { isTokenExpired: true };
    await dbService.updateOne(
      userTokens,
      { _id: userToken.id },
      updatedDocument,
    );
    return res.success({ message: "Logged Out Successfully" });
  } catch (error) {
    return res.internalServerError({ data: error.message });
  }
};

const changeGuashala = async (req, res) => {
  try {
    const userId = req.user.id;
    const gaushala_id = req.user.gaushala_id;
    const change_gaushala_id = req.body.change_gaushala_id;
    const userType = req.user.userType;

    const findGaushala = await dbService.findMany(default_variable, {
      group: "gaushala_list",
      default_id: change_gaushala_id,
      isDeleted: false,
    });

    if (!findGaushala) {
      return res.recordNotFound({
        message: `Gaushala id not found in db : ${change_gaushala_id}`,
      });
    }

    if (!change_gaushala_id) {
      return res.badRequest({ message: `Please enter change gaushala id` });
    }

    if (
      userType === authConstant.USER_TYPES.User ||
      userType === authConstant.USER_TYPES.dairy ||
      userType === authConstant.USER_TYPES.ground ||
      userType === authConstant.USER_TYPES.medical
    ) {
      return res.unAuthorized();
    }

    if (gaushala_id === change_gaushala_id) {
      return res.badRequest({
        message: `You are already in same gaushala ${change_gaushala_id}`,
      });
    }

    const userData = await dbService.findOne(User, { _id: userId });

    if (!userData) {
      return res.recordNotFound();
    }

    const changeGuashala = await dbService.updateOne(
      User,
      { _id: userId },
      { gaushala_id: change_gaushala_id },
    );
    let token = await auth.generateToken(changeGuashala, JWT.DEVICE_SECRET);

    // Convert Mongoose document to plain JavaScript object
    const changeGuashalaObject = changeGuashala.toObject();

    let updatedDocument = { isTokenExpired: true };
    await dbService.updateOne(
      userTokens,
      { userId: userId, isTokenExpired: false },
      updatedDocument,
    );
    let expire = dayjs().add(JWT.EXPIRES_IN, "second").toISOString();
    await dbService.create(userTokens, {
      userId: userId,
      token: token,
      tokenExpiredTime: expire,
    });

    const userToReturn = {
      ...changeGuashalaObject,
      token: token,
    };

    return res.success({ data: userToReturn });
  } catch (error) {
    return res.internalServerError({ data: error.message });
  }
};

module.exports = {
  changeGuashala,
  register,
  login,
  forgotPassword,
  validateResetPasswordOtp,
  resetPassword,
  logout,
  updatePassword,
  getUserIdsByGaushala,
  updateMultiplePasswords,
};
