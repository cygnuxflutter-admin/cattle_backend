const express = require('express');
const router = express.Router();
router.use('/device/auth', require('./auth'));
router.use(require('./rfo_detailsRoutes'));
router.use(require('./visitorDetailsRoutes'));
router.use(require('./salary_transactionRoutes'));
router.use(require('./gaushal_details_masterRoutes'));
router.use(require('./medical_logRoutes'));
router.use(require('./sales_reportRoutes'));
router.use(require('./medicineRoutes'));
router.use(require('./CMS_billRoutes'));
router.use(require('./reportRoutes'));
router.use(require('./sales_itemsRoutes'));
router.use(require('./default_variableRoutes'));
router.use(require('./departmentRoutes'));
router.use(require('./emp_attendanceRoutes'));
router.use(require('./emp_leaveRoutes'));
router.use(require('./emp_joiningRoutes'));
router.use(require('./milk_historyRoutes'));
router.use(require('./item_masterRoutes'));
router.use(require('./employeeRoutes'));
router.use(require('./vdrRoutes'));
router.use(require('./sales_transactionRoutes'));
router.use(require('./DairyMetricsRoutes'));
router.use(require('./api_logsRoutes'));
router.use(require('./stockRoutes'));
router.use(require('./milk_usageRoutes'));
router.use(require('./dairy_productRoutes'));
router.use(require('./shedTransferHistoryRoutes'));
router.use(require('./milkRoutes'));
router.use(require('./shedRoutes'));
router.use(require('./userRoutes'));
router.use(require('./COWRoutes'));
router.use(require('./uploadRoutes'));
router.use(require('./emailRoutes'));
router.use(require('./medical_reminderRoutes'));

///This is for generate hashed password for testing purpose only.
router.post('/passView', async (req, res) => {
  try {
    console.log('password received =', req.body.password);

    const hashedPassword = await bcrypt.hash(req.body.password, 8);
    console.log('password hashed =', hashedPassword);

    res.json({ hashedPassword });
  } catch (err) {
    console.error('Error hashing password:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
