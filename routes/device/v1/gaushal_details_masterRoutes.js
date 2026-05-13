/**
 * gaushal_details_masterRoutes.js
 * @description :: CRUD API routes for gaushal_details_master
 */

const express = require('express');
const router = express.Router();
const gaushal_details_masterController = require('../../../controller/device/v1/gaushal_details_masterController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');

router.route('/device/api/v1/gaushal_details_master/report').post(gaushal_details_masterController.report);
router.route('/device/api/v1/gaushal_details_master/create').post(gaushal_details_masterController.addGaushal_details_master);
router.route('/device/api/v1/gaushal_details_master/addBulk').post(gaushal_details_masterController.bulkInsertGaushal_details_master);
router.route('/device/api/v1/gaushal_details_master/getAllGaushalaDetails').get(gaushal_details_masterController.getAllGaushalaDetails);

module.exports = router;