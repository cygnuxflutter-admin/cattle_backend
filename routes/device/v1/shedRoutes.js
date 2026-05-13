/**
 * shedRoutes.js
 * @description :: CRUD API routes for shed
 */

const express = require('express');
const router = express.Router();
const shedController = require('../../../controller/device/v1/shedController');
const { PLATFORM } =  require('../../../constants/authConstant'); 
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/shed/create').post(auth(PLATFORM.DEVICE),checkRolePermission,shedController.addShed);
router.route('/device/api/v1/shed/list').post(auth(PLATFORM.DEVICE),checkRolePermission,shedController.findAllShed);
router.route('/device/api/v1/shed/count').post(auth(PLATFORM.DEVICE),checkRolePermission,shedController.getShedCount);
router.route('/device/api/v1/shed/:id').get(auth(PLATFORM.DEVICE),checkRolePermission,shedController.getShed);
router.route('/device/api/v1/shed/update/:id').put(auth(PLATFORM.DEVICE),checkRolePermission,shedController.updateShed);    
router.route('/device/api/v1/shed/partial-update/:id').put(auth(PLATFORM.DEVICE),checkRolePermission,shedController.partialUpdateShed);
router.route('/device/api/v1/shed/softDelete/:id').put(auth(PLATFORM.DEVICE),checkRolePermission,shedController.softDeleteShed);
router.route('/device/api/v1/shed/softDeleteMany').put(auth(PLATFORM.DEVICE),checkRolePermission,shedController.softDeleteManyShed);
router.route('/device/api/v1/shed/addBulk').post(auth(PLATFORM.DEVICE),checkRolePermission,shedController.bulkInsertShed);
router.route('/device/api/v1/shed/updateBulk').put(auth(PLATFORM.DEVICE),checkRolePermission,shedController.bulkUpdateShed);
router.route('/device/api/v1/shed/delete/:id').delete(auth(PLATFORM.DEVICE),checkRolePermission,shedController.deleteShed);
router.route('/device/api/v1/shed/deleteMany').post(auth(PLATFORM.DEVICE),checkRolePermission,shedController.deleteManyShed);

module.exports = router;
