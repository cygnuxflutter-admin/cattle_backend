/**
 * stockRoutes.js
 * @description :: CRUD API routes for stock
 */

const express = require('express');
const router = express.Router();
const stockController = require('../../../controller/device/v1/stockController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.route('/device/api/v1/stock/manual_stock_entry_old').post(stockController.manual_stock_entry_old);
router.route('/device/api/v1/stock/getData').post(stockController.getData);
router.route('/device/api/v1/stock/getUniqueRFO').post(stockController.getUniqueRFO);
router.route('/device/api/v1/stock/manual_stock_entry').post(stockController.manual_stock_entry);
router.route('/device/api/v1/stock/addBulk').post(upload.array('images', 50), auth(PLATFORM.DEVICE), checkRolePermission, stockController.bulkInsertStock);
router.route('/device/api/v1/stock/updateStockAsPerRFO').post(stockController.updateStockAsPerRFO);
router.route('/device/api/v1/stock/deleteRecordAsRFO').post(auth(PLATFORM.DEVICE), checkRolePermission, stockController.deleteRecordAsRFO);
router.route('/device/api/v1/stock/create').post(auth(PLATFORM.DEVICE), checkRolePermission, stockController.addStock);
router.route('/device/api/v1/stock/lastRFONo').get(auth(PLATFORM.DEVICE), checkRolePermission, stockController.lastRFONo);
router.route('/device/api/v1/stock/list').post(auth(PLATFORM.DEVICE), checkRolePermission, stockController.findAllStock);


///New
router.route('/device/api/v1/stock/getMonthlyStock').post(auth(PLATFORM.DEVICE), checkRolePermission, stockController.getMonthlyStockSummary);





router.route('/device/api/v1/stock/count').post(auth(PLATFORM.DEVICE), checkRolePermission, stockController.getStockCount);
router.route('/device/api/v1/stock/:id').get(auth(PLATFORM.DEVICE), checkRolePermission, stockController.getStock);
router.route('/device/api/v1/stock/update/:id').post(auth(PLATFORM.DEVICE), checkRolePermission, stockController.updateStock);
router.route('/device/api/v1/stock/partial-update/:id').post(auth(PLATFORM.DEVICE), checkRolePermission, stockController.partialUpdateStock);

router.route('/device/api/v1/stock/validateRFO').post(auth(PLATFORM.DEVICE), checkRolePermission, stockController.validateRFO);
router.route('/device/api/v1/stock/getRFODetails').post(auth(PLATFORM.DEVICE), checkRolePermission, stockController.getRFODetails);
router.route('/device/api/v1/stock/uploadStockBill').post(upload.array('images', 50), stockController.uploadStockBill);

module.exports = router;
