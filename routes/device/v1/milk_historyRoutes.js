const express = require('express');
const router = express.Router();
const milk_historyController = require('../../../controller/device/v1/milk_historyController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/milk_history/create').post(auth(PLATFORM.DEVICE), checkRolePermission, milk_historyController.addMilk_history);
router.route('/device/api/v1/milk_history/list').post(auth(PLATFORM.DEVICE), checkRolePermission, milk_historyController.findAllMilk_history);
router.route('/device/api/v1/milk_history/count').post(auth(PLATFORM.DEVICE), checkRolePermission, milk_historyController.getMilk_historyCount);
router.route('/device/api/v1/milk_history/:id').get(auth(PLATFORM.DEVICE), checkRolePermission, milk_historyController.getMilk_history);
router.route('/device/api/v1/milk_history/update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, milk_historyController.updateMilk_history);
router.route('/device/api/v1/milk_history/partial-update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, milk_historyController.partialUpdateMilk_history);

module.exports = router;
