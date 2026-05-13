const express = require('express');
const router = express.Router();
const vendorController = require('../../../controller/device/v1/vdr_controller');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/vendor/create').post(auth(PLATFORM.DEVICE), checkRolePermission, vendorController.addVendor);
router.route('/device/api/v1/vendor/list').get(auth(PLATFORM.DEVICE), checkRolePermission, vendorController.findAllVendor);
router.route('/device/api/v1/vendor/count').post(auth(PLATFORM.DEVICE), checkRolePermission, vendorController.getVendorCount);
router.route('/device/api/v1/vendor/:id').get(auth(PLATFORM.DEVICE), checkRolePermission, vendorController.getVendor);
router.route('/device/api/v1/vendor/update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, vendorController.updateVendor);
router.route('/device/api/v1/vendor/partial-update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, vendorController.partialUpdateVendor);

module.exports = router;