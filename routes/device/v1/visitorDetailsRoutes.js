/**
 * visitorDetailsRoutes.js
 * @description :: CRUD API routes for visitorDetails
 */

const express = require('express');
const router = express.Router();
const visitorDetailsController = require('../../../controller/device/v1/visitorDetailsController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/visitordetails/create').post(visitorDetailsController.addVisitorDetails);
router.route('/device/api/v1/visitordetails/list').post(auth(PLATFORM.DEVICE), checkRolePermission, visitorDetailsController.findAllVisitorDetails);
router.route('/device/api/v1/visitordetails/count').post(auth(PLATFORM.DEVICE), checkRolePermission, visitorDetailsController.getVisitorDetailsCount);
router.route('/device/api/v1/visitordetails/:id').get(auth(PLATFORM.DEVICE), checkRolePermission, visitorDetailsController.getVisitorDetails);
router.route('/device/api/v1/visitordetails/update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, visitorDetailsController.updateVisitorDetails);
router.route('/device/api/v1/visitordetails/partial-update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, visitorDetailsController.partialUpdateVisitorDetails);
router.route('/device/api/v1/visitordetails/softDelete/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, visitorDetailsController.softDeleteVisitorDetails);
router.route('/device/api/v1/visitordetails/softDeleteMany').put(auth(PLATFORM.DEVICE), checkRolePermission, visitorDetailsController.softDeleteManyVisitorDetails);
router.route('/device/api/v1/visitordetails/addBulk').post(auth(PLATFORM.DEVICE), checkRolePermission, visitorDetailsController.bulkInsertVisitorDetails);
router.route('/device/api/v1/visitordetails/updateBulk').put(auth(PLATFORM.DEVICE), checkRolePermission, visitorDetailsController.bulkUpdateVisitorDetails);
router.route('/device/api/v1/visitordetails/delete/:id').delete(auth(PLATFORM.DEVICE), checkRolePermission, visitorDetailsController.deleteVisitorDetails);
router.route('/device/api/v1/visitordetails/deleteMany').post(auth(PLATFORM.DEVICE), checkRolePermission, visitorDetailsController.deleteManyVisitorDetails);

module.exports = router;