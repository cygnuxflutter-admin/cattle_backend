/**
 * medical_logRoutes.js
 * @description :: CRUD API routes for medical_log
 */

const express = require('express');
const router = express.Router();
const medical_logController = require('../../../controller/device/v1/medical_logController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/medical_log/create').post(auth(PLATFORM.DEVICE), checkRolePermission, medical_logController.addMedical_log);
router.route('/device/api/v1/medical_log/addBulk').post(auth(PLATFORM.DEVICE), checkRolePermission, medical_logController.bulkInsertMedical_log);
router.route('/device/api/v1/medical_log/list').post(auth(PLATFORM.DEVICE), checkRolePermission, medical_logController.findAllMedical_log);
router.route('/device/api/v1/medical_log/count').post(auth(PLATFORM.DEVICE), checkRolePermission, medical_logController.getMedical_logCount);
router.route('/device/api/v1/medical_log/:id').get(auth(PLATFORM.DEVICE), checkRolePermission, medical_logController.getMedical_log);
router.route('/device/api/v1/medical_log/update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, medical_logController.updateMedical_log);
router.route('/device/api/v1/medical_log/partial-update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, medical_logController.partialUpdateMedical_log);
router.route('/device/api/v1/medical_log/updateBulk').put(auth(PLATFORM.DEVICE), checkRolePermission, medical_logController.bulkUpdateMedical_log);
router.route('/device/api/v1/medical_log/softDelete/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, medical_logController.softDeleteMedical_log);
router.route('/device/api/v1/medical_log/softDeleteMany').put(auth(PLATFORM.DEVICE), checkRolePermission, medical_logController.softDeleteManyMedical_log);
router.route('/device/api/v1/medical_log/delete/:id').delete(auth(PLATFORM.DEVICE), checkRolePermission, medical_logController.deleteMedical_log);
router.route('/device/api/v1/medical_log/deleteMany').post(auth(PLATFORM.DEVICE), checkRolePermission, medical_logController.deleteManyMedical_log);

module.exports = router;
