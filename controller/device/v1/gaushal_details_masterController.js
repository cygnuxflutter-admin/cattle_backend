/**
 * gaushal_details_masterController.js
 * @description : exports action methods for gaushal_details_master.
 */

const Gaushal_details_master = require('../../../model/gaushal_details_master');
const gaushal_details_masterSchemaKey = require('../../../utils/validation/gaushal_details_masterValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const { isToday, parseDatabaseDate, isLatestDate, isBeforeLatestDatess, getTodayDate } = require('../../../utils/common');
const { getAllCalculations, } = require('./reportController');
const COW = require('../../../model/COW');
const { subtractOneMonth, addZeroInMonth } = require('../../../utils/common');

/**
 * @description : create document of Gaushal_details_master in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Gaushal_details_master. {status, message, data}
 */
const addGaushal_details_master = async (req, res) => {
    try {
        let dataToCreate = { ...req.body || {} };
        let validateRequest = validation.validateParamsWithJoi(
            dataToCreate,
            gaushal_details_masterSchemaKey.schemaKeys);
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }
        dataToCreate = new Gaushal_details_master(dataToCreate);
        let createdGaushal_details_master = await dbService.create(Gaushal_details_master, dataToCreate);
        return res.success({ data: createdGaushal_details_master });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : create multiple documents of Gaushal_details_master in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created Gaushal_details_masters. {status, message, data}
 */
const bulkInsertGaushal_details_master = async (req, res) => {
    try {
        if (req.body && (!Array.isArray(req.body.data) || req.body.data.length < 1)) {
            return res.badRequest();
        }
        let dataToCreate = [...req.body.data];
        let createdGaushal_details_masters = await dbService.create(Gaushal_details_master, dataToCreate);
        createdGaushal_details_masters = { count: createdGaushal_details_masters ? createdGaushal_details_masters.length : 0 };
        return res.success({ data: { count: createdGaushal_details_masters.count || 0 } });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : find all documents of Gaushal_details_master from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Gaushal_details_master(s). {status, message, data}
 */
const getAllGaushalaDetails = async (req, res) => {
    try {

        const todayDate = getTodayDate();
        const dateParts = todayDate.split('-');
        const month = dateParts[1];
        const year = dateParts[0];
        const curDate = dateParts[2];

        let options = {};
        let query = {};

        query.date = {
            $regex: `^${year}-${month}-\\d{2}`, // Matches '2023-10-XX' format
        };

        options.select = [
            "gaushala_id",
            "cattle_count",
            "expense",
            "per_cattle_expense",
            "production",
            "stock",
            "date"
        ];

        let foundGaushal_details_masters = await dbService.findAll(Gaushal_details_master, query, options);
        if (!foundGaushal_details_masters || !foundGaushal_details_masters.length) {
            return res.recordNotFound();
        }
        return res.success({ data: foundGaushal_details_masters });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

const report = async (req, res) => {
    try {

        const year = req.body.year;
        const month = req.body.month;
        const gaushala_id = req.body.gaushala_id;

        const reportData = await gaushal_details_master_report(year, month, gaushala_id)

        const getDataOfCurrentMonth = getCurrentMonthData(reportData.foundSales_reports, reportData.getMonthlyExpence);

        const cows = await dbService.findAll(COW, {}, {});
        const cowsCount = cows.length;

        const per_cattle_expense = getDataOfCurrentMonth.expenseData.total_used_amount / cowsCount;

        const dataToCreate = {
            "gaushala_id": gaushala_id,
            "cattle_count": cowsCount,
            "expense": getDataOfCurrentMonth.expenseData.total_used_amount,
            "per_cattle_expense": per_cattle_expense,
            "production": getDataOfCurrentMonth.salesData.total_sales_amount,
            "stock": getDataOfCurrentMonth.expenseData.closing_amount,
            "date": "Mississippi"
        }

        return res.success({ data: a });


    } catch (error) {
        return res.internalServerError({ message: error.message });

    }
}


async function gaushal_details_master_report(year, month, gaushala_id) {
    // try {
    const todayDate = getTodayDate();
    const dateParts = todayDate.split('-');
    const curMonth = dateParts[1];
    const curYear = dateParts[0];
    const curDate = dateParts[2];
    let getDataOfCurrentMonthStock = [];
    let currentMonthData = [];

    if ((year > curYear) || (year >= curYear && month > curMonth)) {
        return; // Stop the recursion when we reach the current month/year.
    }


    let date = `${year}-${month}-${curDate}`;

    let options = {};
    let query = {};
    query.gaushala_id = gaushala_id;
    query.date = {
        $regex: `^${year}-\\d{2}-\\d{2}`, // Matches '2023-10-XX' format
    };

    let updateQuery = {};
    updateQuery.gaushala_id = gaushala_id;
    updateQuery.date = {
        $regex: `^${year}-${month}-\\d{2}`, // Matches '2023-10-XX' format
    };

    const getAllCalculation = await getAllCalculations({ query: query, options: options, year: year, gaushala_id: gaushala_id })

    // return res.success({ data: getAllCalculation });

    const getDataOfCurrentMonth = getCurrentMonthData(getAllCalculation.foundSales_reports, getAllCalculation.getMonthlyExpence, year, month);

    const cows = await dbService.findAll(COW, {
        gaushala_id, type: { $nin: ["Donate", "Died"] }, shed_id: { $nin: ["NA", "DONATION", "DIED"] }
    }, {});
    const cowsCount = cows.length;

    const expenseData = getDataOfCurrentMonth.expenseData;
    const totalUsedAmount = expenseData ? expenseData.total_used_amount : 0;
    const per_cattle_expense = cowsCount !== 0 ? totalUsedAmount / cowsCount : 0;

    // Limiting to 3 digits after the decimal point
    const totalUsedAmountFormatted = totalUsedAmount.toFixed(3);

    const dataToCreate = {
        "gaushala_id": gaushala_id,
        "cattle_count": cowsCount,
        "expense": totalUsedAmountFormatted,
        "per_cattle_expense": per_cattle_expense,
        "production": getDataOfCurrentMonth.salesData.total_sales_amount,
        "stock": getDataOfCurrentMonth.expenseData.closing_amount,
        "date": date
    }

    currentMonthData = await getGaushalaDetailsCurrentMonthData(year, month, gaushala_id)

    if (currentMonthData.length == 0) {
        await dbService.create(Gaushal_details_master, dataToCreate);

    } else {
        await dbService.updateOne(Gaushal_details_master, updateQuery, dataToCreate);
    }


    console.log("gaushal_details_master_report : " + `${year}-${month}`)

    month++;

    if (month > 12) {
        month = 1;
        year++;
    }
    // await new Promise((resolve) => setTimeout(resolve, 10000)); // Simulate an async operation (e.g., waiting for 10 seconds).
    return gaushal_details_master_report(year, month, gaushala_id);

    // } catch (error) {
    //     return res.internalServerError({ message: error.message });
    // }

}

function getCurrentMonthData(salesReports, monthlyExpenses, year, month) {
    const currentMonthKey = `${year}-${month}`;

    // Find sales report for the current month
    const currentMonthSales = salesReports.find(report => report.date.startsWith(currentMonthKey));

    // Find monthly expense for the current month
    const currentMonthExpense = monthlyExpenses.find(expense => expense._id === currentMonthKey);

    // Create an object combining sales and expense data for the current month
    const result = {
        currentMonth: currentMonthKey,
        salesData: currentMonthSales || { total_sales_amount: 0 },
        expenseData: currentMonthExpense || { total_used_amount: 0, opening_amount: 0, closing_amount: 0 }
    };

    return result;
}

function getGaushalaDetailsCurrentMonthData(currentYear, currentMonth, gaushala_id) {

    currentMonth = addZeroInMonth(currentMonth);

    const matchStage = {
        date: {
            $regex: `^${currentYear}-${currentMonth}-\\d{2}`, // Matches '2023-10-XX' format
        },
        gaushala_id: gaushala_id,
    };

    return Gaushal_details_master.aggregate([
        {
            $match: matchStage,
        }
    ]);
}

module.exports = {
    gaushal_details_master_report,
    report,
    addGaushal_details_master,
    bulkInsertGaushal_details_master,
    getAllGaushalaDetails,
};