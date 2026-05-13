/**
 * milk_usageRoutes.js
 * @description :: CRUD API routes for milk_usage
 */

const express = require('express');
const router = express.Router();
const milk_usageController = require('../../../controller/device/v1/milk_usageController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/milk_usage/create').post(auth(PLATFORM.DEVICE), checkRolePermission, milk_usageController.addMilk_usage);
// router.route('/device/api/v1/milk_usage/todayMilkUsage').get(milk_usageController.getTodayMilkUsage);
router.route('/device/api/v1/milk_usage/todayMilkUsage').get(auth(PLATFORM.DEVICE), checkRolePermission, milk_usageController.getTodayMilkUsage);
//router.route('/device/api/v1/milk_usage/create').post(auth(PLATFORM.DEVICE),checkRolePermission,milk_usageController.addMilk_usage);
router.route('/device/api/v1/milk_usage/addBulk').post(auth(PLATFORM.DEVICE), checkRolePermission, milk_usageController.bulkInsertMilk_usage);
router.route('/device/api/v1/milk_usage/list').post(auth(PLATFORM.DEVICE), checkRolePermission, milk_usageController.findAllMilk_usage);
router.route('/device/api/v1/milk_usage/count').post(auth(PLATFORM.DEVICE), checkRolePermission, milk_usageController.getMilk_usageCount);
router.route('/device/api/v1/milk_usage/:id').get(auth(PLATFORM.DEVICE), checkRolePermission, milk_usageController.getMilk_usage);
router.route('/device/api/v1/milk_usage/update/:id').post(auth(PLATFORM.DEVICE), checkRolePermission, milk_usageController.updateMilk_usage);
router.route('/device/api/v1/milk_usage/partial-update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, milk_usageController.partialUpdateMilk_usage);

module.exports = router;
