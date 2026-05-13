const express = require('express');
const router = express.Router();
const emailController = require('../../../controller/device/v1/emailController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');


router.route('/device/api/v1/email/sendMail').post(emailController.sendMail);
router.route('/device/api/v1/email/sendSalesEmail').post(emailController.sendSalesEmail);
router.route('/device/api/v1/email/sendExpenseReport').post(emailController.sendExpenseReport);
router.route('/device/api/v1/email/sendProfitLossReport').post(emailController.sendProfitLossReport);

module.exports = router;