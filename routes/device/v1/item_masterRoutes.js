/**
 * item_masterRoutes.js
 * @description :: CRUD API routes for item_master
 */

const express = require('express');
const router = express.Router();
const item_masterController = require('../../../controller/device/v1/item_masterController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/item_master/create').post(auth(PLATFORM.DEVICE), checkRolePermission, item_masterController.addItem_master);
router.route('/device/api/v1/item_master/all_items_with_stock').post(auth(PLATFORM.DEVICE), checkRolePermission, item_masterController.all_items_with_stock);
router.route('/device/api/v1/item_master/addBulk').post(auth(PLATFORM.DEVICE), checkRolePermission, item_masterController.bulkInsertItem_master);
router.route('/device/api/v1/item_master/list').post(auth(PLATFORM.DEVICE), checkRolePermission, item_masterController.findAllItem_master);
router.route('/device/api/v1/item_master/count').post(auth(PLATFORM.DEVICE), checkRolePermission, item_masterController.getItem_masterCount);
router.route('/device/api/v1/item_master/:id').get(auth(PLATFORM.DEVICE), checkRolePermission, item_masterController.getItem_master);
router.route('/device/api/v1/item_master/update/:itemId').post(auth(PLATFORM.DEVICE), checkRolePermission, item_masterController.updateItem_master);
router.route('/device/api/v1/item_master/partial-update/:id').post(auth(PLATFORM.DEVICE), checkRolePermission, item_masterController.partialUpdateItem_master);

module.exports = router;