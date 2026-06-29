/**
 * medical_reminderRoutes.js
 * @description :: CRUD API routes and pending reminders endpoint for medical_reminder
 */

const express = require('express');
const router = express.Router();
const medical_reminderController = require('../../../controller/device/v1/medical_reminderController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/medical-reminder/create').post(auth(PLATFORM.DEVICE), checkRolePermission, medical_reminderController.addMedicalReminder);
router.route('/device/api/v1/medical-reminder/list').post(auth(PLATFORM.DEVICE), checkRolePermission, medical_reminderController.findAllMedicalReminder);
router.route('/device/api/v1/medical-reminder/pending-list').post(auth(PLATFORM.DEVICE), checkRolePermission, medical_reminderController.getPendingReminders);
router.route('/device/api/v1/medical-reminder/:id').get(auth(PLATFORM.DEVICE), checkRolePermission, medical_reminderController.getMedicalReminder);
router.route('/device/api/v1/medical-reminder/update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, medical_reminderController.updateMedicalReminder);
router.route('/device/api/v1/medical-reminder/partial-update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, medical_reminderController.partialUpdateMedicalReminder);
router.route('/device/api/v1/medical-reminder/softDelete/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, medical_reminderController.softDeleteMedicalReminder);
router.route('/device/api/v1/medical-reminder/delete/:id').delete(auth(PLATFORM.DEVICE), checkRolePermission, medical_reminderController.deleteMedicalReminder);

module.exports = router;
