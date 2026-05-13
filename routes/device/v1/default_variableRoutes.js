/**
 * default_variableRoutes.js
 * @description :: CRUD API routes for default_variable
 */

const express = require('express');
const router = express.Router();
const default_variableController = require('../../../controller/device/v1/default_variableController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/default_variable/create').post(auth(PLATFORM.DEVICE), checkRolePermission, default_variableController.addDefault_variable);
router.route('/device/api/v1/default_variable/bulls').get(auth(PLATFORM.DEVICE), checkRolePermission, default_variableController.bulls);
router.route('/device/api/v1/default_variable/addBulk').post(auth(PLATFORM.DEVICE), checkRolePermission, default_variableController.bulkInsertDefault_variable);
router.route('/device/api/v1/default_variable/list').get(auth(PLATFORM.DEVICE), checkRolePermission, default_variableController.findAllDefault_variable);
router.route('/device/api/v1/default_variable/count').post(auth(PLATFORM.DEVICE), checkRolePermission, default_variableController.getDefault_variableCount);
router.route('/device/api/v1/default_variable/:id').get(auth(PLATFORM.DEVICE), checkRolePermission, default_variableController.getDefault_variable);
router.route('/device/api/v1/default_variable/update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, default_variableController.updateDefault_variable);
router.route('/device/api/v1/default_variable/partial-update/:id').post(auth(PLATFORM.DEVICE), checkRolePermission, default_variableController.partialUpdateDefault_variable);
router.route('/device/api/v1/default_variable/updateBulk').put(auth(PLATFORM.DEVICE), checkRolePermission, default_variableController.bulkUpdateDefault_variable);
router.route('/device/api/v1/default_variable/getDefault_stock_items').post(auth(PLATFORM.DEVICE), checkRolePermission, default_variableController.getDefault_stock_items);
router.route('/device/api/v1/default_variable/getDefualt_breeds').post(auth(PLATFORM.DEVICE), checkRolePermission, default_variableController.getDefualt_breeds);
router.route('/device/api/v1/default_variable/getDefault_sheds').post(auth(PLATFORM.DEVICE), checkRolePermission, default_variableController.getDefault_sheds);
router.route('/device/api/v1/default_variable/getDefualt_cowTypes').post(auth(PLATFORM.DEVICE), checkRolePermission, default_variableController.getDefualt_cowTypes);
router.route('/device/api/v1/default_variable/getDefault_distribution_free_person').post(auth(PLATFORM.DEVICE), checkRolePermission, default_variableController.getDefault_distribution_free_person);
router.route('/device/api/v1/default_variable/getDefault_expense_types').post(auth(PLATFORM.DEVICE), checkRolePermission, default_variableController.getDefault_expense_types);
router.route('/device/api/v1/default_variable/getDefault_vehicles').post(auth(PLATFORM.DEVICE), checkRolePermission, default_variableController.getDefault_vehicles);

module.exports = router;