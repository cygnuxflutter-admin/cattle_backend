const express = require('express');
const router = express.Router();
const auth = require('../../../middleware/auth');
const authController = require('../../../controller/device/v1/authController');
const { PLATFORM } = require('../../../constants/authConstant');

router.route('/register').post(authController.register);
router.route('/updatePassword').post(authController.updatePassword);

router.route('/updateMultiplePassword').post(authController.updateMultiplePasswords);
router.route('/getAllUserIds').get(authController.getUserIdsByGaushala);
router.post('/login', authController.login);
router.route('/forgot-password').post(authController.forgotPassword);
router.route('/validate-otp').post(authController.validateResetPasswordOtp);
router.route('/reset-password').put(authController.resetPassword);
router.route('/logout').post(auth(PLATFORM.DEVICE), authController.logout);
router.route('/changeGuashala').post(auth(PLATFORM.DEVICE), authController.changeGuashala);

module.exports = router;