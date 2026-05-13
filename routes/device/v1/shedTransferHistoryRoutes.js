/**
 * shedTransferHistoryRoutes.js
 * @description :: CRUD API routes for shedTransferHistory
 */

const express = require('express');
const router = express.Router();
const shedTransferHistoryController = require('../../../controller/device/v1/shedTransferHistoryController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/shedtransferhistory/cobinedCowShedApi').post(auth(PLATFORM.DEVICE), checkRolePermission, shedTransferHistoryController.combinedCoWndShedTransfer);
router.route('/device/api/v1/shedtransferhistory/create').post(auth(PLATFORM.DEVICE), checkRolePermission, shedTransferHistoryController.addShedTransferHistory);
router.route('/device/api/v1/shedtransferhistory/list').post(auth(PLATFORM.DEVICE), checkRolePermission, shedTransferHistoryController.findAllShedTransferHistory);
router.route('/device/api/v1/shedtransferhistory/count').post(auth(PLATFORM.DEVICE), checkRolePermission, shedTransferHistoryController.getShedTransferHistoryCount);
router.route('/device/api/v1/shedtransferhistory/:id').get(auth(PLATFORM.DEVICE), checkRolePermission, shedTransferHistoryController.getShedTransferHistory);
router.route('/device/api/v1/shedtransferhistory/update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, shedTransferHistoryController.updateShedTransferHistory);
router.route('/device/api/v1/shedtransferhistory/partial-update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, shedTransferHistoryController.partialUpdateShedTransferHistory);

module.exports = router;
