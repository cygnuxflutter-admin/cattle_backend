/**
 * sales_transactionRoutes.js
 * @description :: CRUD API routes for sales_transaction
 */

const express = require('express');
const router = express.Router();
const sales_transactionController = require('../../../controller/device/v1/sales_transactionController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/sales_transaction/addBulkSales').post(sales_transactionController.addBulkSales);
router.route('/device/api/v1/sales_transaction/create').post(auth(PLATFORM.DEVICE), checkRolePermission, sales_transactionController.addSales_transaction);
router.route('/device/api/v1/sales_transaction/list').post(auth(PLATFORM.DEVICE), checkRolePermission, sales_transactionController.findAllSales_transaction);


///New
router.route('/device/api/v1/sales_transaction/Monthlylist').post(auth(PLATFORM.DEVICE), checkRolePermission, sales_transactionController.getMonthlySalesSummary);
router.route('/device/api/v1/sales_transaction/dashBoardSalesReport').post(auth(PLATFORM.DEVICE), checkRolePermission, sales_transactionController.getDashBoardSalesReports);




router.route('/device/api/v1/sales_transaction/count').post(auth(PLATFORM.DEVICE), checkRolePermission, sales_transactionController.getSales_transactionCount);
router.route('/device/api/v1/sales_transaction/:id').get(auth(PLATFORM.DEVICE), checkRolePermission, sales_transactionController.getSales_transaction);
router.route('/device/api/v1/sales_transaction/update/:id').post(auth(PLATFORM.DEVICE), checkRolePermission, sales_transactionController.updateSales_transaction);
router.route('/device/api/v1/sales_transaction/partial-update/:id').post(auth(PLATFORM.DEVICE), checkRolePermission, sales_transactionController.partialUpdateSales_transaction);

module.exports = router;
