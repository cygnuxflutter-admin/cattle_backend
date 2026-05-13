const express = require('express');
const router = express.Router();
const rfo_detailsController = require('../../../controller/device/v1/rfo_detailsController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/rfo_details/create').post(auth(PLATFORM.DEVICE), checkRolePermission, rfo_detailsController.addRfo_details);
router.route('/device/api/v1/rfo_details/addBulk').post(auth(PLATFORM.DEVICE), checkRolePermission, rfo_detailsController.bulkInsertRfo_details);
router.route('/device/api/v1/rfo_details/list').post(auth(PLATFORM.DEVICE), checkRolePermission, rfo_detailsController.findAllRfo_details);
router.route('/device/api/v1/rfo_details/count').post(auth(PLATFORM.DEVICE), checkRolePermission, rfo_detailsController.getRfo_detailsCount);
router.route('/device/api/v1/rfo_details/:id').get(auth(PLATFORM.DEVICE), checkRolePermission, rfo_detailsController.getRfo_details);
router.route('/device/api/v1/rfo_details/update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, rfo_detailsController.updateRfo_details);
router.route('/device/api/v1/rfo_details/partial-update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, rfo_detailsController.partialUpdateRfo_details);
router.route('/device/api/v1/rfo_details/updateBulk').put(auth(PLATFORM.DEVICE), checkRolePermission, rfo_detailsController.bulkUpdateRfo_details);
router.route('/device/api/v1/rfo_details/softDelete/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, rfo_detailsController.softDeleteRfo_details);
router.route('/device/api/v1/rfo_details/softDeleteMany').put(auth(PLATFORM.DEVICE), checkRolePermission, rfo_detailsController.softDeleteManyRfo_details);
router.route('/device/api/v1/rfo_details/delete/:id').delete(auth(PLATFORM.DEVICE), checkRolePermission, rfo_detailsController.deleteRfo_details);
router.route('/device/api/v1/rfo_details/deleteMany').post(auth(PLATFORM.DEVICE), checkRolePermission, rfo_detailsController.deleteManyRfo_details);

module.exports = router;
