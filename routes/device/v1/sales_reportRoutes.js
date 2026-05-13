/**
 * sales_reportRoutes.js
 * @description :: CRUD API routes for sales_report
 */

const express = require('express');
const router = express.Router();
const sales_reportController = require('../../../controller/device/v1/sales_reportController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/sales_report/create').post(auth(PLATFORM.DEVICE), checkRolePermission, sales_reportController.addSales_report);
router.route('/device/api/v1/sales_report/addBulk').post(auth(PLATFORM.DEVICE), checkRolePermission, sales_reportController.bulkInsertSales_report);
router.route('/device/api/v1/sales_report/list').post(auth(PLATFORM.DEVICE), checkRolePermission, sales_reportController.findAllSales_report);
router.route('/device/api/v1/sales_report/count').post(auth(PLATFORM.DEVICE), checkRolePermission, sales_reportController.getSales_reportCount);
router.route('/device/api/v1/sales_report/:id').get(auth(PLATFORM.DEVICE), checkRolePermission, sales_reportController.getSales_report);
router.route('/device/api/v1/sales_report/update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, sales_reportController.updateSales_report);
router.route('/device/api/v1/sales_report/partial-update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, sales_reportController.partialUpdateSales_report);
router.route('/device/api/v1/sales_report/updateBulk').put(auth(PLATFORM.DEVICE), checkRolePermission, sales_reportController.bulkUpdateSales_report);
router.route('/device/api/v1/sales_report/softDelete/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, sales_reportController.softDeleteSales_report);
router.route('/device/api/v1/sales_report/softDeleteMany').put(auth(PLATFORM.DEVICE), checkRolePermission, sales_reportController.softDeleteManySales_report);
router.route('/device/api/v1/sales_report/delete/:id').delete(auth(PLATFORM.DEVICE), checkRolePermission, sales_reportController.deleteSales_report);
router.route('/device/api/v1/sales_report/deleteMany').post(auth(PLATFORM.DEVICE), checkRolePermission, sales_reportController.deleteManySales_report);

module.exports = router;