const cron = require('node-cron');
const reportController = require('../controller/device/v1/reportController');
const dairyMetricsController = require('../controller/device/v1/DairyMetricsController');
const salary_transactionController = require('../controller/device/v1/salary_transactionController');
const stockController = require('../controller/device/v1/stockController');


//cron for dashboard data and report
// In this code, the cron schedule '0 14 * * *' is used. This schedule means that the task will run at 2:00 PM every day. The first field ('0') represents the minute, and the second field ('14') represents the hour.
cron.schedule('50 23 * * *', async () => {
    console.log('✈️✈️✈️ Running scheduled task...');

    await dairyMetricsController.cronForDashboard();
    await reportController.createAllReport();

    console.log('Over scheduled task...✈️✈️✈️');
});


// cron for salary
cron.schedule('50 23 28-31 * *', async () => {
    // Check if it's the last day of the month
    const lastDayOfMonth = new Date().getDate() === new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    if (lastDayOfMonth) {
        console.log('💸💸💸 Running Salary Generate task on the last day of the month at 23:50...');

        await salary_transactionController.cronForSalary();

        console.log('Over Salary Generate task...💸💸💸');
    }
});

// cron for auto generate stock
cron.schedule('00 23 * * *', async () => {
    console.log('🌀🌀🌀 Running auto generate stock task...');

    await stockController.autoGenerateStock();

    console.log('Over auto generate stock task...🌀🌀🌀');
});