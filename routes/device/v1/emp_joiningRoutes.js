/**
 * emp_joiningRoutes.js
 * @description :: CRUD API routes for emp_joining
 */

const express = require('express');
const router = express.Router();
const emp_joiningController = require('../../../controller/device/v1/emp_joiningController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/emp_joining/create').post(auth(PLATFORM.DEVICE), checkRolePermission, emp_joiningController.addEmp_joining);
router.route('/device/api/v1/emp_joining/addBulk').post(auth(PLATFORM.DEVICE), checkRolePermission, emp_joiningController.bulkInsertEmp_joining);
router.route('/device/api/v1/emp_joining/list').get(auth(PLATFORM.DEVICE), checkRolePermission, emp_joiningController.findAllEmp_joining);
router.route('/device/api/v1/emp_joining/count').post(auth(PLATFORM.DEVICE), checkRolePermission, emp_joiningController.getEmp_joiningCount);
router.route('/device/api/v1/emp_joining/:id').get(auth(PLATFORM.DEVICE), checkRolePermission, emp_joiningController.getEmp_joining);
router.route('/device/api/v1/emp_joining/update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, emp_joiningController.updateEmp_joining);
router.route('/device/api/v1/emp_joining/partial-update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, emp_joiningController.partialUpdateEmp_joining);

module.exports = router;