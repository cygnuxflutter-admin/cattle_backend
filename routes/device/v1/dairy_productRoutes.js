/**
 * dairy_productRoutes.js
 * @description :: CRUD API routes for dairy_product
 */

const express = require('express');
const router = express.Router();
const dairy_productController = require('../../../controller/device/v1/dairy_productController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/dairy_product/create').post(auth(PLATFORM.DEVICE), checkRolePermission, dairy_productController.addDairy_product);
router.route('/device/api/v1/dairy_product/addBulk').post(auth(PLATFORM.DEVICE), checkRolePermission, dairy_productController.bulkInsertDairy_product);
router.route('/device/api/v1/dairy_product/list').get(auth(PLATFORM.DEVICE), checkRolePermission, dairy_productController.findAllDairy_product);
router.route('/device/api/v1/dairy_product/count').post(auth(PLATFORM.DEVICE), checkRolePermission, dairy_productController.getDairy_productCount);
router.route('/device/api/v1/dairy_product/:id').get(auth(PLATFORM.DEVICE), checkRolePermission, dairy_productController.getDairy_product);
router.route('/device/api/v1/dairy_product/update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, dairy_productController.updateDairy_product);
router.route('/device/api/v1/dairy_product/partial-update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, dairy_productController.partialUpdateDairy_product);

module.exports = router;