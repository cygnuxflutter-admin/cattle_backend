/**
 * salary_transactionRoutes.js
 * @description :: CRUD API routes for salary_transaction
 */

const express = require('express');
const router = express.Router();
const salary_transactionController = require('../../../controller/device/v1/salary_transactionController');
const { PLATFORM } = require('../../../constants/authConstant');
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/salary_transaction/cronForSalary').post(salary_transactionController.cronForSalary);
router.route('/device/api/v1/salary_transaction/create').post(auth(PLATFORM.DEVICE), checkRolePermission, salary_transactionController.addSalary_transaction);
router.route('/device/api/v1/salary_transaction/addBulk').post(auth(PLATFORM.DEVICE), checkRolePermission, salary_transactionController.bulkInsertSalary_transaction);
router.route('/device/api/v1/salary_transaction/list').post(auth(PLATFORM.DEVICE), checkRolePermission, salary_transactionController.findAllSalary_transaction);
router.route('/device/api/v1/salary_transaction/update/:id').post(auth(PLATFORM.DEVICE), checkRolePermission, salary_transactionController.updateSalary_transaction);
router.route('/device/api/v1/salary_transaction/partial-update/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, salary_transactionController.partialUpdateSalary_transaction);
router.route('/device/api/v1/salary_transaction/softDelete/:id').put(auth(PLATFORM.DEVICE), checkRolePermission, salary_transactionController.softDeleteSalary_transaction);

module.exports = router;