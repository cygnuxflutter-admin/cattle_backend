/**
 * medicineRoutes.js
 * @description :: CRUD API routes for medicine
 */

const express = require('express');
const router = express.Router();
const medicineController = require('../../../controller/device/v1/medicineController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/medicine/addNewMedicine').post(auth(PLATFORM.DEVICE), checkRolePermission, medicineController.addNewMedicine);
router.route('/device/api/v1/medicine/removeMedicine').post(auth(PLATFORM.DEVICE), checkRolePermission, medicineController.removeMedicine);
router.route('/device/api/v1/medicine/getUpcomingMedications').post(auth(PLATFORM.DEVICE), checkRolePermission, medicineController.getUpcomingMedications);
router.route('/device/api/v1/medicine/getPendingVaccineCows').post(auth(PLATFORM.DEVICE), checkRolePermission, medicineController.getPendingVaccineCows);
router.route('/device/api/v1/medicine/bulkAddMedicine').post(auth(PLATFORM.DEVICE), checkRolePermission, medicineController.bulkAddMedicine);
router.route('/device/api/v1/medicine/getMedicationHistory').post(auth(PLATFORM.DEVICE), checkRolePermission, medicineController.getMedicationHistory);
router.route('/device/api/v1/medicine/getPendingMedications').post(auth(PLATFORM.DEVICE), checkRolePermission, medicineController.getPendingMedications);
router.route('/device/api/v1/medicine/create').post(auth(PLATFORM.DEVICE), checkRolePermission, medicineController.addMedicine);
router.route('/device/api/v1/medicine/list').post(auth(PLATFORM.DEVICE), checkRolePermission, medicineController.findAllMedicine);
router.route('/device/api/v1/medicine/getMedicineByCowId').post(auth(PLATFORM.DEVICE), checkRolePermission, medicineController.getMedicineByCowId);
router.route('/device/api/v1/medicineUpdate').post(auth(PLATFORM.DEVICE), checkRolePermission, medicineController.medicineUpdate);
router.route('/device/api/v1/medicine/softDelete/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, medicineController.softDeleteMedicine);
router.route('/device/api/v1/medicine/delete/:id').delete(auth(PLATFORM.DEVICE), checkRolePermission, medicineController.deleteMedicine);

module.exports = router;
