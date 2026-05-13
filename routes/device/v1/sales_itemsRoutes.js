/**
 * sales_itemsRoutes.js
 * @description :: CRUD API routes for sales_items
 */

const express = require('express');
const router = express.Router();
const sales_itemsController = require('../../../controller/device/v1/sales_itemsController');
const { PLATFORM } =  require('../../../constants/authConstant'); 
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/sales_items/create').post(auth(PLATFORM.DEVICE),checkRolePermission,sales_itemsController.addSales_items);
router.route('/device/api/v1/sales_items/addBulk').post(auth(PLATFORM.DEVICE),checkRolePermission,sales_itemsController.bulkInsertSales_items);
router.route('/device/api/v1/sales_items/list').get(auth(PLATFORM.DEVICE),checkRolePermission,sales_itemsController.findAllSales_items);
router.route('/device/api/v1/sales_items/count').post(auth(PLATFORM.DEVICE),checkRolePermission,sales_itemsController.getSales_itemsCount);
router.route('/device/api/v1/sales_items/:id').get(auth(PLATFORM.DEVICE),checkRolePermission,sales_itemsController.getSales_items);
router.route('/device/api/v1/sales_items/update/:id').put(auth(PLATFORM.DEVICE),checkRolePermission,sales_itemsController.updateSales_items);    
router.route('/device/api/v1/sales_items/partial-update/:id').put(auth(PLATFORM.DEVICE),checkRolePermission,sales_itemsController.partialUpdateSales_items);
router.route('/device/api/v1/sales_items/updateBulk').put(auth(PLATFORM.DEVICE),checkRolePermission,sales_itemsController.bulkUpdateSales_items);

module.exports = router;