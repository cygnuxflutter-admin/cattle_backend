/**
 * departmentRoutes.js
 * @description :: CRUD API routes for department
 */

const express = require('express');
const router = express.Router();
const departmentController = require('../../../controller/device/v1/departmentController');
const { PLATFORM } =  require('../../../constants/authConstant'); 
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/department/create').post(auth(PLATFORM.DEVICE),checkRolePermission,departmentController.addDepartment);
router.route('/device/api/v1/department/addBulk').post(auth(PLATFORM.DEVICE),checkRolePermission,departmentController.bulkInsertDepartment);
router.route('/device/api/v1/department/list').get(auth(PLATFORM.DEVICE),checkRolePermission,departmentController.findAllDepartment);
router.route('/device/api/v1/department/count').post(auth(PLATFORM.DEVICE),checkRolePermission,departmentController.getDepartmentCount);
router.route('/device/api/v1/department/:id').get(auth(PLATFORM.DEVICE),checkRolePermission,departmentController.getDepartment);
router.route('/device/api/v1/department/update/:id').post(auth(PLATFORM.DEVICE),checkRolePermission,departmentController.updateDepartment);    
router.route('/device/api/v1/department/partial-update/:id').post(auth(PLATFORM.DEVICE),checkRolePermission,departmentController.partialUpdateDepartment);
router.route('/device/api/v1/department/updateBulk').post(auth(PLATFORM.DEVICE),checkRolePermission,departmentController.bulkUpdateDepartment);

module.exports = router;