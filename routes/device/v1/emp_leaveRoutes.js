/**
 * emp_leaveRoutes.js
 * @description :: CRUD API routes for emp_leave
 */

const express = require('express');
const router = express.Router();
const emp_leaveController = require('../../../controller/device/v1/emp_leaveController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/emp_leave/create').post(auth(PLATFORM.DEVICE), checkRolePermission, emp_leaveController.addEmp_leave);
router.route('/device/api/v1/emp_leave/list').post(auth(PLATFORM.DEVICE), checkRolePermission, emp_leaveController.findAllEmp_leave);
router.route('/device/api/v1/emp_leave/count').post(auth(PLATFORM.DEVICE), checkRolePermission, emp_leaveController.getEmp_leaveCount);
router.route('/device/api/v1/emp_leave/:id').get(auth(PLATFORM.DEVICE), checkRolePermission, emp_leaveController.getEmp_leave);
router.route('/device/api/v1/emp_leave/update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, emp_leaveController.updateEmp_leave);
router.route('/device/api/v1/emp_leave/partial-update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, emp_leaveController.partialUpdateEmp_leave);

module.exports = router;