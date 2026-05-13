/**
 * COWRoutes.js
 * @description :: CRUD API routes for COW
 */

const express = require('express');
const router = express.Router();
const COWController = require('../../../controller/device/v1/COWController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.route('/device/api/v1/cow/updateMilkAsPerNewTag02').post(COWController.updateMilkAsPerNewTag02);
router.route('/device/api/v1/cow/updateDamSair').post(COWController.updateDamSair);
router.route('/device/api/v1/cow/manualCowAdd').post(COWController.manualCowAdd);
router.route('/device/api/v1/cow/getCowFamily').post(auth(PLATFORM.DEVICE), checkRolePermission, COWController.getCowFamily);
router.route('/device/api/v1/cow/getCowsMilkInfo').post(auth(PLATFORM.DEVICE), checkRolePermission, COWController.getCowsMilkInfo);
router.route('/device/api/v1/cow/getSairFamily').post(auth(PLATFORM.DEVICE), checkRolePermission, COWController.getSairFamily);
router.route('/device/api/v1/cow/getLastCowId').get(auth(PLATFORM.DEVICE), checkRolePermission, COWController.getCowLsatID);


//upload.array('images', 5)  this means this allow 5 images only
router.route('/device/api/v1/cow/updateSendDiedCows').post(COWController.updateSendDiedCows);
router.route('/device/api/v1/cow/uploadCowImage').post(upload.array('files', 5), COWController.uploadCowImage);
router.route('/device/api/v1/milk/checkTagIds').post(auth(PLATFORM.DEVICE), checkRolePermission, COWController.checkTagIds);
router.route('/device/api/v1/milk/deleteDuplicate').post(auth(PLATFORM.DEVICE), checkRolePermission, COWController.removeDuplicate);
router.route('/device/api/v1/cow/cowTransfer').post(auth(PLATFORM.DEVICE), checkRolePermission, COWController.cowTransfer);
router.route('/device/api/v1/cow/create').post(auth(PLATFORM.DEVICE), checkRolePermission, COWController.addCOW);
router.route('/device/api/v1/cow/addBulk').post(auth(PLATFORM.DEVICE), checkRolePermission, COWController.bulkInsertCOW);
router.route('/device/api/v1/cow/list').post(auth(PLATFORM.DEVICE), checkRolePermission, COWController.findAllCOW);
// router.route('/device/api/v1/cow/Update').get(auth(PLATFORM.DEVICE), checkRolePermission, COWController.bulkUpdateCOW);
router.route('/device/api/v1/cow/count').post(auth(PLATFORM.DEVICE), checkRolePermission, COWController.getCOWCount);
router.route('/device/api/v1/cow/getCow').post(auth(PLATFORM.DEVICE), checkRolePermission, COWController.getCOW);
router.route('/device/api/v1/cow/update/:id').post(auth(PLATFORM.DEVICE), checkRolePermission, COWController.updateCOW);
router.route('/device/api/v1/cow/partial-update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, COWController.partialUpdateCOW);
router.route('/device/api/v1/cow/updateBulk').put(auth(PLATFORM.DEVICE), checkRolePermission, COWController.bulkUpdateCOW);
router.route('/device/api/v1/cow/softDelete/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, COWController.softDeleteCOW);
router.route('/device/api/v1/cow/softDeleteMany').put(auth(PLATFORM.DEVICE), checkRolePermission, COWController.softDeleteManyCOW);
router.route('/device/api/v1/cow/delete/:id').delete(auth(PLATFORM.DEVICE), checkRolePermission, COWController.deleteCOW);
router.route('/device/api/v1/cow/deleteMany').post(auth(PLATFORM.DEVICE), checkRolePermission, COWController.deleteManyCOW);

module.exports = router;