const express = require('express');
const router = express.Router();
const api_logsController = require('../../../controller/device/v1/api_logsController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');

router.route('/device/api/v1/api_logs/setCowBdays').post(api_logsController.setCowBdays);
router.route('/device/api/v1/api_logs/setCowBdayDB').post(api_logsController.setCowBdayDB);
router.route('/device/api/v1/api_logs/updateCowTag').post(api_logsController.updateCowTag);
router.route('/device/api/v1/api_logs/create').post(api_logsController.addApi_logs);
router.route('/device/api/v1/api_logs/list').post(api_logsController.findAllApi_logs);
router.route('/device/api/v1/api_logs/count').post(api_logsController.getApi_logsCount);
router.route('/device/api/v1/api_logs/:id').get(api_logsController.getApi_logs);

module.exports = router;