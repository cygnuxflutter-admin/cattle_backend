/**
 * emp_attendanceRoutes.js
 * @description :: CRUD API routes for emp_attendance
 */

const express = require('express');
const router = express.Router();
const emp_attendanceController = require('../../../controller/device/v1/emp_attendanceController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/emp_attendance/create').post(auth(PLATFORM.DEVICE), checkRolePermission, emp_attendanceController.addEmp_attendance);
router.route('/device/api/v1/emp_attendance/findAllAbsent_emp').post(auth(PLATFORM.DEVICE), checkRolePermission, emp_attendanceController.findAllAbsent_emp);
router.route('/device/api/v1/emp_attendance/addBulk').post(auth(PLATFORM.DEVICE), checkRolePermission, emp_attendanceController.bulkInsertEmp_attendance);
router.route('/device/api/v1/emp_attendance/list').post(auth(PLATFORM.DEVICE), checkRolePermission, emp_attendanceController.findAllEmp_attendance);
router.route('/device/api/v1/emp_attendance/count').post(auth(PLATFORM.DEVICE), checkRolePermission, emp_attendanceController.getEmp_attendanceCount);
router.route('/device/api/v1/emp_attendance/:id').get(auth(PLATFORM.DEVICE), checkRolePermission, emp_attendanceController.getEmp_attendance);
router.route('/device/api/v1/emp_attendance/update/:id').post(auth(PLATFORM.DEVICE), checkRolePermission, emp_attendanceController.updateEmp_attendance);
router.route('/device/api/v1/emp_attendance/partial-update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, emp_attendanceController.partialUpdateEmp_attendance);

module.exports = router;