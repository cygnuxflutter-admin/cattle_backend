const express = require('express');
const router = express.Router();
const reportController = require('../../../controller/device/v1/reportController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/report/cattleReportMonthlyAddedCounts').post(auth(PLATFORM.DEVICE), checkRolePermission, reportController.cattleReportMonthlyAddedCounts);
router.route('/device/api/v1/report/salesReportAllDepartmentsMonthly').post(auth(PLATFORM.DEVICE), checkRolePermission, reportController.salesReportAllDepartmentsMonthly);
router.route('/device/api/v1/report/getItemStock').post(auth(PLATFORM.DEVICE), checkRolePermission, reportController.getItemStock);
router.route('/device/api/v1/report/createAllReport').post(auth(PLATFORM.DEVICE), checkRolePermission, reportController.createAllReport);
router.route('/device/api/v1/report/milkReport').post(auth(PLATFORM.DEVICE), checkRolePermission, reportController.milkReport);
router.route('/device/api/v1/report/salesReportMonthlyItems').post(auth(PLATFORM.DEVICE), checkRolePermission, reportController.salesReportMonthlyItems);
// router.route('/device/api/v1/report/salesReport').post(reportController.salesReport);
router.route('/device/api/v1/report/salesReportMonthlyDepartment').post(auth(PLATFORM.DEVICE), checkRolePermission, reportController.salesReportMonthlyDepartment);
router.route('/device/api/v1/report/create').post(auth(PLATFORM.DEVICE), checkRolePermission, reportController.addReport);
router.route('/device/api/v1/report/addBulk').post(auth(PLATFORM.DEVICE), checkRolePermission, reportController.bulkInsertReport);
router.route('/device/api/v1/report/stockReport').post(auth(PLATFORM.DEVICE), checkRolePermission, reportController.findAllStockReport);
router.route('/device/api/v1/report/stockReport1').post(auth(PLATFORM.DEVICE), checkRolePermission, reportController.findAllSales_report1);
router.route('/device/api/v1/report/salesReport').post(auth(PLATFORM.DEVICE), checkRolePermission, reportController.findAllSales_report);
router.route('/device/api/v1/report/cattleReport').post(auth(PLATFORM.DEVICE), checkRolePermission, reportController.cattleReport);


module.exports = router;