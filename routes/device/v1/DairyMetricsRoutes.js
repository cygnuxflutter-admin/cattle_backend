const express = require('express');
const router = express.Router();
const DairyMetricsController = require('../../../controller/device/v1/DairyMetricsController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/dairymetrics/getReminders').get(auth(PLATFORM.DEVICE), checkRolePermission, DairyMetricsController.getReminders);
router.route('/device/api/v1/dairymetrics/updateHistory').post(DairyMetricsController.updateHistory);
router.route('/device/api/v1/dairymetrics/cron').get(auth(PLATFORM.DEVICE), checkRolePermission, DairyMetricsController.cronForDashboard);
router.route('/device/api/v1/dairymetrics/create').post(auth(PLATFORM.DEVICE), checkRolePermission, DairyMetricsController.addDairyMetrics);
router.route('/device/api/v1/dairymetrics/list').post(auth(PLATFORM.DEVICE), checkRolePermission, DairyMetricsController.findAllDairyMetrics);
router.route('/device/api/v1/dairymetrics/count').post(auth(PLATFORM.DEVICE), checkRolePermission, DairyMetricsController.getDairyMetricsCount);
router.route('/device/api/v1/dairymetrics/:id').get(auth(PLATFORM.DEVICE), checkRolePermission, DairyMetricsController.getDairyMetrics);
router.route('/device/api/v1/dairymetrics/update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, DairyMetricsController.updateDairyMetrics);
router.route('/device/api/v1/dairymetrics/partial-update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, DairyMetricsController.partialUpdateDairyMetrics);
router.route('/device/api/v1/dairymetrics/addAppVirsion').post(DairyMetricsController.addAppVersion);
router.route('/device/api/v1/dairymetrics/getLatestAppVersion').post(DairyMetricsController.getLatestAppVersion);

module.exports = router;