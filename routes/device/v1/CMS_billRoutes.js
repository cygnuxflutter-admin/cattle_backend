const express = require('express');
const router = express.Router();
const CMS_billController = require('../../../controller/device/v1/CMS_billController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/cms_bill/getReminderRFOs').post(auth(PLATFORM.DEVICE), checkRolePermission, CMS_billController.getReminderRFOs);
router.route('/device/api/v1/cms_bill/create').post(auth(PLATFORM.DEVICE), checkRolePermission, CMS_billController.addCMS_bill);
router.route('/device/api/v1/cms_bill/getPendingRFOs').post(auth(PLATFORM.DEVICE), checkRolePermission, CMS_billController.getPendingRFOs);
router.route('/device/api/v1/cms_bill/getRFOSummery').post(auth(PLATFORM.DEVICE), checkRolePermission, CMS_billController.getRFOSummery);
router.route('/device/api/v1/cms_bill/getAddedRFOs').post(auth(PLATFORM.DEVICE), checkRolePermission, CMS_billController.getAddedRFOs);
router.route('/device/api/v1/cms_bill/addBulk').post(auth(PLATFORM.DEVICE), checkRolePermission, CMS_billController.bulkInsertCMS_bill);
router.route('/device/api/v1/cms_bill/list').post(auth(PLATFORM.DEVICE), checkRolePermission, CMS_billController.findAllCMS_bill);
router.route('/device/api/v1/cms_bill/count').post(auth(PLATFORM.DEVICE), checkRolePermission, CMS_billController.getCMS_billCount);
router.route('/device/api/v1/cms_bill/:id').get(auth(PLATFORM.DEVICE), checkRolePermission, CMS_billController.getCMS_bill);
router.route('/device/api/v1/cms_bill/update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, CMS_billController.updateCMS_bill);
router.route('/device/api/v1/cms_bill/partial-update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, CMS_billController.partialUpdateCMS_bill);
router.route('/device/api/v1/cms_bill/updateBulk').put(auth(PLATFORM.DEVICE), checkRolePermission, CMS_billController.bulkUpdateCMS_bill);

module.exports = router;