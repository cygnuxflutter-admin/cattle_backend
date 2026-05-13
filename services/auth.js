/**
 * auth.js
 * @description :: functions used in authentication
 */

const User = require("../model/user");
const dbService = require("../utils/dbService");
const userTokens = require("../model/userTokens");
const {
  JWT,
  LOGIN_ACCESS,
  PLATFORM,
  MAX_LOGIN_RETRY_LIMIT,
  LOGIN_REACTIVE_TIME,
  FORGOT_PASSWORD_WITH,
} = require("../constants/authConstant");
const jwt = require("jsonwebtoken");
const common = require("../utils/common");
const dayjs = require("dayjs");
const bcrypt = require("bcryptjs");
const emailService = require("./email");
const smsService = require("./sms");
const ejs = require("ejs");
const uuid = require("uuid").v4;


const generateToken = async (user, secret) => {
  return jwt.sign(
    {
      id: user.id,
      user_id: user.user_id,
    },
    secret,
    { expiresIn: JWT.EXPIRES_IN * 60 },
  );
};



const loginUser = async (username, password, platform, roleAccess) => {
  try {
    let where = { user_id: username };
    where.isActive = true;
    where.isDeleted = false;
    let user = await dbService.findOne(User, where);
    if (user) {
      if (user.loginRetryLimit >= MAX_LOGIN_RETRY_LIMIT) {
        let now = dayjs();
        if (user.loginReactiveTime) {
          let limitTime = dayjs(user.loginReactiveTime);
          if (limitTime > now) {
            let expireTime = dayjs().add(LOGIN_REACTIVE_TIME, "minute");
            if (!(limitTime > expireTime)) {
              return {
                flag: true,
                data: `you have exceed the number of limit.you can login after ${common.getDifferenceOfTwoDatesInTime(now, limitTime)}.`,
              };
            }
            await dbService.updateOne(
              User,
              { _id: user.id },
              {
                loginReactiveTime: expireTime.toISOString(),
                loginRetryLimit: user.loginRetryLimit + 1,
              },
            );
            return {
              flag: true,
              data: `you have exceed the number of limit.you can login after ${common.getDifferenceOfTwoDatesInTime(now, expireTime)}.`,
            };
          } else {
            user = await dbService.updateOne(
              User,
              { _id: user.id },
              {
                loginReactiveTime: "",
                loginRetryLimit: 0,
              },
              { new: true },
            );
          }
        } else {
          // send error
          let expireTime = dayjs().add(LOGIN_REACTIVE_TIME, "minute");
          await dbService.updateOne(
            User,
            {
              _id: user.id,
              isActive: true,
              isDeleted: false,
            },
            {
              loginReactiveTime: expireTime.toISOString(),
              loginRetryLimit: user.loginRetryLimit + 1,
            },
          );
          return {
            flag: true,
            data: `you have exceed the number of limit.you can login after ${common.getDifferenceOfTwoDatesInTime(now, expireTime)}.`,
          };
        }
      }
      if (password) {
        const isPasswordMatched = await user.isPasswordMatch(password);
        if (!isPasswordMatched) {
          await dbService.updateOne(
            User,
            {
              _id: user.id,
              isActive: true,
              isDeleted: false,
            },
            { loginRetryLimit: user.loginRetryLimit + 1 },
          );
          return {
            flag: true,
            data: "Incorrect Password",
          };
        }
      }
      const userData = user.toJSON();
      let token;
      if (!user.userType) {
        return {
          flag: true,
          data: "You have not been assigned any role",
        };
      }
      if (platform == PLATFORM.DEVICE) {
        if (!LOGIN_ACCESS[user.userType].includes(PLATFORM.DEVICE)) {
          return {
            flag: true,
            data: "you are unable to access this platform",
          };
        }
        token = await generateToken(userData, JWT.DEVICE_SECRET);
      } else if (platform == PLATFORM.ADMIN) {
        if (!LOGIN_ACCESS[user.userType].includes(PLATFORM.ADMIN)) {
          return {
            flag: true,
            data: "you are unable to access this platform",
          };
        }
        token = await generateToken(userData, JWT.ADMIN_SECRET);
      }
      if (user.loginRetryLimit) {
        await dbService.updateOne(
          User,
          { _id: user.id },
          {
            loginRetryLimit: 0,
            loginReactiveTime: "",
          },
        );
      }
      let updatedDocument = { isTokenExpired: true };
      await dbService.updateOne(
        userTokens,
        { userId: user.id, isTokenExpired: false },
        updatedDocument,
      );
      let expire = dayjs().add(JWT.EXPIRES_IN, "second").toISOString();
      await dbService.create(userTokens, {
        userId: user.id,
        token: token,
        tokenExpiredTime: expire,
      });
      let userToReturn = {
        ...userData,
        token,
      };
      if (roleAccess) {
        userToReturn.roleAccess = await common.getRoleAccessData(user.id);
      }
      return {
        flag: false,
        data: userToReturn,
      };
    } else {
      return {
        flag: true,
        data: "User not exists",
      };
    }
  } catch (error) {
    throw new Error(error.message);
  }
};


const changePassword = async (params) => {
  try {
    let password = params.newPassword;
    let oldPassword = params.oldPassword;
    let where = {
      _id: params.userId,
      isActive: true,
      isDeleted: false,
    };
    let user = await dbService.findOne(User, where);
    if (user && user.id) {
      let isPasswordMatch = await user.isPasswordMatch(oldPassword);
      if (!isPasswordMatch) {
        return {
          flag: true,
          data: "Incorrect old password",
        };
      }
      password = await bcrypt.hash(password, 8);
      let updatedUser = dbService.updateOne(User, where, {
        password: password,
      });
      if (updatedUser) {
        return {
          flag: false,
          data: "Password changed successfully",
        };
      }
      return {
        flag: true,
        data: "password can not changed due to some error.please try again",
      };
    }
    return {
      flag: true,
      data: "User not found",
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const sendResetPasswordNotification = async (user) => {
  let resultOfEmail = false;
  let resultOfSMS = false;
  try {
    let where = {
      _id: user.id,
      isActive: true,
      isDeleted: false,
    };
    let token = uuid();
    let expires = dayjs();
    expires = expires
      .add(FORGOT_PASSWORD_WITH.EXPIRE_TIME, "minute")
      .toISOString();
    await dbService.updateOne(User, where, {
      resetPasswordLink: {
        code: token,
        expireTime: expires,
      },
    });
    if (FORGOT_PASSWORD_WITH.LINK.email) {
      let viewType = "/reset-password/";
      let mailObj = {
        subject: "Reset Password",
        to: user.email,
        template: "/views/email/ResetPassword",
        data: {
          userName: user.username || "-",
          link: `http://localhost:${process.env.PORT}` + viewType + token,
          linkText: "Reset Password",
        },
      };
      try {
        await emailService.sendMail(mailObj);
        resultOfEmail = true;
      } catch (error) {
        console.log(error);
      }
    }
    if (FORGOT_PASSWORD_WITH.LINK.sms) {
      let viewType = "/reset-password/";
      let link = `http://localhost:${process.env.PORT}${viewType + token}`;
      const msg = await ejs.renderFile(
        `${__basedir}/views/sms/ResetPassword/html.ejs`,
        { link: link },
      );
      let smsObj = {
        to: user.mobileNo,
        message: msg,
      };
      try {
        await smsService.sendSMS(smsObj);
        resultOfSMS = true;
      } catch (error) {
        console.log(error);
      }
    }
    return {
      resultOfEmail,
      resultOfSMS,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const resetPassword = async (user, newPassword) => {
  try {
    let where = {
      _id: user.id,
      isActive: true,
      isDeleted: false,
    };
    const dbUser = await dbService.findOne(User, where);
    if (!dbUser) {
      return {
        flag: true,
        data: "User not found",
      };
    }
    newPassword = await bcrypt.hash(newPassword, 8);
    await dbService.updateOne(User, where, {
      password: newPassword,
      resetPasswordLink: null,
      loginRetryLimit: 0,
    });
    let mailObj = {
      subject: "Reset Password",
      to: user.email,
      template: "/views/email/SuccessfulPasswordReset",
      data: {
        isWidth: true,
        email: user.email || "-",
        message: "Your password has been changed Successfully.",
      },
    };
    await emailService.sendMail(mailObj);
    return {
      flag: false,
      data: "Password reset successfully",
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const sendPasswordBySMS = async (user) => {
  try {
    const msg = await ejs.renderFile(
      `${__basedir}/views/sms/InitialPassword/html.ejs`,
      { password: user.password },
    );
    let smsObj = {
      to: user.mobileNo,
      message: msg,
    };
    await smsService.sendSMS(smsObj);
    return true;
  } catch (error) {
    return false;
  }
};

const sendPasswordByEmail = async (user) => {
  try {
    let msg = `Your Password for login : ${user.password}`;
    let mailObj = {
      subject: "Your Password!",
      to: user.email,
      template: "/views/email/InitialPassword",
      data: { message: msg },
    };
    try {
      await emailService.sendMail(mailObj);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports = {
  generateToken,
  loginUser,
  changePassword,
  sendResetPasswordNotification,
  resetPassword,
  sendPasswordBySMS,
  sendPasswordByEmail
};
