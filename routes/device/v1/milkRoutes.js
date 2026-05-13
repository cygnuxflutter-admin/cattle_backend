/**
 * milkRoutes.js
 * @description :: CRUD API routes for milk
 */

const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const milkController = require("../../../controller/device/v1/milkController");
const { PLATFORM } = require("../../../constants/authConstant");
const auth = require("../../../middleware/auth");
const checkRolePermission = require("../../../middleware/checkRolePermission");

// router.route('/device/api/v1/milk/getTodayMilkHistory').post(milkController.getTodayMilkHistory);
router
  .route("/device/api/v1/milk/getTodayMilkHistory")
  .post(
    auth(PLATFORM.DEVICE),
    checkRolePermission,
    milkController.getTodayMilkHistory
  );
router
  .route("/device/api/v1/milk/validateMilk")
  .post(
    auth(PLATFORM.DEVICE),
    checkRolePermission,
    milkController.validateMilk
  );
router
  .route("/device/api/v1/milk/todayMilk/:id")
  .get(
    auth(PLATFORM.DEVICE),
    checkRolePermission,
    milkController.todayMilkHistory
  );
router
  .route("/device/api/v1/milk/lastSevenDayMilkData")
  .get(
    auth(PLATFORM.DEVICE),
    checkRolePermission,
    milkController.lastSevenDayMilkData
  );
router
  .route("/device/api/v1/milk/todayTotalMilk")
  .get(
    auth(PLATFORM.DEVICE),
    checkRolePermission,
    milkController.todayTotalMilk
  );
// router.route('/device/api/v1/milk/todayTotalMilk').get(milkController.todayTotalMilk);
router
  .route("/device/api/v1/milk/defaultVariables")
  .get(
    auth(PLATFORM.DEVICE),
    checkRolePermission,
    milkController.defaultVariables
  );
router
  .route("/device/api/v1/milk/create")
  .post(auth(PLATFORM.DEVICE), checkRolePermission, milkController.addMilk);
router
  .route("/device/api/v1/milk/list")
  .post(auth(PLATFORM.DEVICE), checkRolePermission, milkController.findAllMilk);
router
  .route("/device/api/v1/milk/count")
  .post(
    auth(PLATFORM.DEVICE),
    checkRolePermission,
    milkController.getMilkCount
  );
router
  .route("/device/api/v1/milk/:id")
  .get(auth(PLATFORM.DEVICE), checkRolePermission, milkController.getMilk);
router
  .route("/device/api/v1/milk/update/:id")
  .put(auth(PLATFORM.DEVICE), checkRolePermission, milkController.updateMilk);
router
  .route("/device/api/v1/milk/partial-update/:id")
  .put(
    auth(PLATFORM.DEVICE),
    checkRolePermission,
    milkController.partialUpdateMilk
  );
router
  .route("/device/api/v1/milk/softDelete/:id")
  .put(
    auth(PLATFORM.DEVICE),
    checkRolePermission,
    milkController.softDeleteMilk
  );
router
  .route("/device/api/v1/milk/softDeleteMany")
  .put(
    auth(PLATFORM.DEVICE),
    checkRolePermission,
    milkController.softDeleteManyMilk
  );
router
  .route("/device/api/v1/milk/addBulk")
  .post(
    auth(PLATFORM.DEVICE),
    checkRolePermission,
    milkController.bulkInsertMilk
  );
router
  .route("/device/api/v1/milk/updateBulk")
  .put(
    auth(PLATFORM.DEVICE),
    checkRolePermission,
    milkController.bulkUpdateMilk
  );
router
  .route("/device/api/v1/milk/delete/:id")
  .delete(
    auth(PLATFORM.DEVICE),
    checkRolePermission,
    milkController.deleteMilk
  );
router
  .route("/device/api/v1/milk/deleteMany")
  .post(
    auth(PLATFORM.DEVICE),
    checkRolePermission,
    milkController.deleteManyMilk
  );


module.exports = router;
