const express = require('express');
const router = express.Router();
const employeeController = require('../../../controller/device/v1/employeeController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/employee/getMonthlyAttendance').post(auth(PLATFORM.DEVICE), checkRolePermission, employeeController.getMonthlyAttendance);
router.route('/device/api/v1/employee/updateEmpID').post(employeeController.updateEmpID);
router.route('/device/api/v1/employee/updateEmpDod').post(employeeController.updateEmpDod);
router.route('/device/api/v1/employee/create').post(auth(PLATFORM.DEVICE), checkRolePermission, employeeController.addEmployee);
router.route('/device/api/v1/employee/addBulk').post(auth(PLATFORM.DEVICE), checkRolePermission, employeeController.bulkInsertEmployee);
router.route('/device/api/v1/employee/list').post(auth(PLATFORM.DEVICE), checkRolePermission, employeeController.findAllEmployee);
router.route('/device/api/v1/employee/count').post(auth(PLATFORM.DEVICE), checkRolePermission, employeeController.getEmployeeCount);
router.route('/device/api/v1/employee/:id').get(auth(PLATFORM.DEVICE), checkRolePermission, employeeController.getEmployee);
router.route('/device/api/v1/employee/update/:id').post(auth(PLATFORM.DEVICE), checkRolePermission, employeeController.updateEmployee);
router.route('/device/api/v1/employee/updateEmployeeSalary').post(auth(PLATFORM.DEVICE), checkRolePermission, employeeController.updateEmployeeSalary);
router.route('/device/api/v1/employee/partial-update/:id').post(auth(PLATFORM.DEVICE), checkRolePermission, employeeController.partialUpdateEmployee);

module.exports = router;