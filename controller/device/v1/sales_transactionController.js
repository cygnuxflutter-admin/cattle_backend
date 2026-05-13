/**
 * sales_transactionController.js
 * @description : exports action methods for sales_transaction.
 */

const Sales_transaction = require("../../../model/sales_transaction");
const sales_transactionSchemaKey = require("../../../utils/validation/sales_transactionValidation");
const validation = require("../../../utils/validateRequest");
const dbService = require("../../../utils/dbService");
const ObjectId = require("mongodb").ObjectId;
const utils = require("../../../utils/common");
const department = require("../../../model/department");
const sales_items = require("../../../model/sales_items");
const authConstant = require("../../../constants/authConstant");
const stockController = require("./stockController");
const stock = require('../../../model/stock');

/**
 * @description : create document of Sales_transaction in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Sales_transaction. {status, message, data}
 */
const addSales_transaction = async (req, res) => {
  try {
    let dataToCreate = { ...(req.body || {}) };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      sales_transactionSchemaKey.schemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({
        message: `Invalid values in parameters, ${validateRequest.message}`,
      });
    }

    // Retrieve the last sleep_number from the database
    // const lastSalesTransaction = await dbService.findOne(Sales_transaction, {}, {}, { sort: { sleep_number: -1 } });
    const lastSalesTransaction = await Sales_transaction.findOne(
      { gaushala_id: req.user.gaushala_id },
      {},
      { sort: { sleep_number: -1 } }
    ).lean();
    let lastSleepNumber = lastSalesTransaction
      ? parseInt(lastSalesTransaction.sleep_number, 10)
      : 999;

    // Increment the last sleep_number by 1
    lastSleepNumber += 1;

    // Convert it back to a string and set the incremented sleep_number in dataToCreate
    dataToCreate.sleep_number = lastSleepNumber.toString();
    dataToCreate.gaushala_id = req.user.gaushala_id;

    dataToCreate = new Sales_transaction(dataToCreate);
    let createdSales_transaction = await dbService.create(
      Sales_transaction,
      dataToCreate
    );
    return res.success({ data: createdSales_transaction });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find all documents of Sales_transaction from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Sales_transaction(s). {status, message, data}
 */
const findAllSales_transaction = async (req, res) => {
  try {
    let reqBody = {
      query: {},
      options: {
        select: [
          "department_id",
          "department_name",
          "item_name",
          "qty",
          "rate",
          "location",
          "total",
          "mobile_number",
          "date",
          "time",
          "gaushala_id",
          "sleep_number",
          "driver_name",
          "vehicle_number",
          "isDeleted",
        ],
        collation: "",
        sort: "",
        populate: "",
        projection: "",
        lean: false,
        leanWithId: true,
        offset: 0,
        page: 1,
        limit: 10,
        pagination: false,
        useEstimatedCount: false,
        useCustomCountFn: false,
        forceCountFn: false,
        read: {},
        options: {},
      },
      isCountOnly: false,
    };
    console.log("req.body1", req.body);
    console.log("req.user2", req.user);
    if (req.body) {
      reqBody = { ...reqBody, ...req.body };
    }
    console.log("reqBody3", reqBody);

    let options = reqBody.options;
    let query = reqBody.query;
    query.gaushala_id = req.user.gaushala_id;

    console.log("query -=-==-=-= ", query);
    if (req.body.startDate && req.body.endDate) {
      // Convert the date strings to Date objects
      const startDate = req.body.startDate;
      const endDate = req.body.endDate;

      // Add a date range condition to the query
      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // Check if the user has provided an item_name filter as an array
    if (Array.isArray(req.body.item_name) && req.body.item_name.length > 0) {
      // Add an item_name condition using $in to match any of the specified values
      query.item_name = {
        $in: req.body.item_name,
      };
    }

    //Department filter
    if (
      Array.isArray(req.body.department_name) &&
      req.body.department_name.length > 0
    ) {
      // Add an department_name condition using $in to match any of the specified values
      query.department_name = {
        $in: req.body.department_name,
      };
    }

    let validateRequest = validation.validateFilterWithJoi(
      reqBody,
      sales_transactionSchemaKey.findFilterKeys,
      Sales_transaction.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof reqBody.query === "object" && reqBody.query !== null) {
      query = { ...reqBody.query };
    }
    if (reqBody.isCountOnly) {
      let totalRecords = await dbService.count(Sales_transaction, query);
      return res.success({ data: { totalRecords } });
    }
    if (
      reqBody &&
      typeof reqBody.options === "object" &&
      reqBody.options !== null
    ) {
      options = { ...reqBody.options };
    }
    console.log("query -=-==-=-= ", query);
    let foundSales_transactions = await dbService.paginate(
      Sales_transaction,
      query,
      options
    );
    if (
      !foundSales_transactions ||
      !foundSales_transactions.data ||
      !foundSales_transactions.data.length
    ) {
      return res.recordNotFound();
    }
    return res.success({ data: foundSales_transactions });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const getMonthlySalesSummary = async (req, res) => {
  try {
    const { year } = req.body;
    if (!year) {
      return res.validationError({ message: "Year is required" });
    }

    const startDate = `${year}-04-01`;
    const endDate = `${parseInt(year) + 1}-03-31`;

    const monthlySummary = await Sales_transaction.aggregate([
      {
        $match: {
          gaushala_id: req.user.gaushala_id,
          isDeleted: false,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $substr: ["$date", 0, 4] },   // YYYY
            month: { $substr: ["$date", 5, 2] }   // MM
          },
          totalAmount: { $sum: "$total" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Convert result into map for quick lookup
    const summaryMap = {};
    monthlySummary.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      summaryMap[key] = item.totalAmount;
    });

    // Generate all 12 months (Apr -> Mar)
    const result = [];
    const startYear = parseInt(year);
    const months = [
      "04", "05", "06", "07", "08", "09",
      "10", "11", "12", "01", "02", "03"
    ];

    months.forEach((month) => {
      const y = (["01","02","03"].includes(month)) ? startYear + 1 : startYear;
      const key = `${y}-${month}`;
      result.push({
        date: key,
        total: summaryMap[key] || 0
      });
    });

    return res.success({
      message: "Monthly totals fetched successfully",
      data: result
    });

  } catch (error) {
    console.error("Error in getMonthlySalesSummary:", error);
    return res.internalServerError({ message: error.message });
  }
};

const getDashBoardSalesReports = async (req, res) => {
  try {
    const { year } = req.body;
    if (!year) {
      return res.validationError({ message: "Year is required" });
    }

    const startDate = `${year}-04-01`;
    const endDate = `${parseInt(year) + 1}-03-31`;

    const monthlyReports = await Sales_transaction.aggregate([
      {
        $match: {
          gaushala_id: req.user.gaushala_id,
          isDeleted: false,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $substr: ["$date", 0, 4] },
            month: { $substr: ["$date", 5, 2] }
          },
          total_sales_amount: { $sum: "$total" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Fill missing months (Apr → Mar)
    const startYear = parseInt(year);
    const months = [
      "04", "05", "06", "07", "08", "09",
      "10", "11", "12", "01", "02", "03"
    ];

    const reports = [];
    months.forEach((m) => {
      const y = ["01","02","03"].includes(m) ? startYear + 1 : startYear;
      const key = `${y}-${m}`;
      const found = monthlyReports.find(r => `${r._id.year}-${r._id.month}` === key);
      reports.push({
        gaushala_id: req.user.gaushala_id,
        date: `${key}-01`,
        total_sales_amount: found ? found.total_sales_amount : 0,
  // generate fake id
      });
    });

    var getMonthlyExpences = await getMonthlyStockSummaryService(year, req.user.gaushala_id);

    return res.success({
      message: "Your request is successfully executed",
      data: { foundSales_reports: reports, getMonthlyExpences }
    });

  } catch (error) {
    console.error("Error in getSalesReports:", error);
    return res.internalServerError({ message: error.message });
  }
};


const getMonthlyStockSummaryService = async (year, gaushala_id) => {
  const startDate = `${year}-04-01`;
  const endDate = `${parseInt(year) + 1}-03-31`;

  const monthlySummary = await stock.aggregate([
    {
      $match: {
        gaushala_id: gaushala_id,
        isDeleted: false,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $substr: ["$date", 0, 4] },
          month: { $substr: ["$date", 5, 2] }
        },
        totalAmount: { $sum: "$total_amount" }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  const summaryMap = {};
  monthlySummary.forEach(item => {
    const key = `${item._id.year}-${item._id.month}`;
    summaryMap[key] = item.totalAmount;
  });

  const startYear = parseInt(year);
  const months = [
    "04", "05", "06", "07", "08", "09",
    "10", "11", "12", "01", "02", "03"
  ];

  const result = [];
  months.forEach((month) => {
    const y = ["01","02","03"].includes(month) ? startYear + 1 : startYear;
    const key = `${y}-${month}`;
    result.push({
      _id: key,
      total: summaryMap[key] || 0
    });
  });

  return result;
};


const getSales_transaction = async (req, res) => {
  try {
    let query = {};
    query.gaushala_id = req.user.gaushala_id;
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message: "invalid objectId." });
    }
    query._id = req.params.id;
    let options = {};
    let foundSales_transaction = await dbService.findOne(
      Sales_transaction,
      query,
      options
    );
    if (!foundSales_transaction) {
      return res.recordNotFound();
    }
    return res.success({ data: foundSales_transaction });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : returns total number of documents of Sales_transaction.
 * @param {Object} req : request including where object to apply filters in req body
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getSales_transactionCount = async (req, res) => {
  try {
    let where = {};
    where.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      sales_transactionSchemaKey.findFilterKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === "object" && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedSales_transaction = await dbService.count(
      Sales_transaction,
      where
    );
    return res.success({ data: { count: countedSales_transaction } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update document of Sales_transaction with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Sales_transaction.
 * @return {Object} : updated Sales_transaction. {status, message, data}
 */
const updateSales_transaction = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body };

    const userType = req.user.userType;

    if (
      userType === authConstant.USER_TYPES.User ||
      userType === authConstant.USER_TYPES.guruji ||
      userType === authConstant.USER_TYPES.medical ||
      userType === authConstant.USER_TYPES.dairy ||
      userType === authConstant.USER_TYPES.ground
    ) {
      return res.unAuthorized({
        message: "You are not authorized to access this functionality.",
      });
    }

    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      sales_transactionSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({
        message: `Invalid values in parameters, ${validateRequest.message}`,
      });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedSales_transaction = await dbService.updateOne(
      Sales_transaction,
      query,
      dataToUpdate
    );
    if (!updatedSales_transaction) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedSales_transaction });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : partially update document of Sales_transaction with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated Sales_transaction.
 * @return {obj} : updated Sales_transaction. {status, message, data}
 */
const partialUpdateSales_transaction = async (req, res) => {
  try {
    if (!req.params.id) {
      res.badRequest({
        message: "Insufficient request parameters! id is required.",
      });
    }
    let dataToUpdate = { ...req.body };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      sales_transactionSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({
        message: `Invalid values in parameters, ${validateRequest.message}`,
      });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedSales_transaction = await dbService.updateOne(
      Sales_transaction,
      query,
      dataToUpdate
    );
    if (!updatedSales_transaction) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedSales_transaction });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

//add data from backend
const addBulkSales = async (req, res) => {
  try {
    const sales_data = req.body.data;

    const errorData = [];
    const successData = [];

    for (var sales of sales_data) {
      const DEP_ID = sales.DEP_ID.toString();
      const ITEM_ID = sales.ITEM_ID.toString();
      const remark = sales.REMARK.toString();

      const findDept = await dbService.findOne(department, {
        department_id: DEP_ID,
      });
      const findItem = await dbService.findOne(sales_items, {
        item_id: ITEM_ID,
      });

      if (!findDept || !findItem) {
        console.log("*** ERROR ****", findDept, findItem);
        errorData.push(sales);
      } else {
        const totalQty = findItem.rate_per_unit * sales.QTY;

        console.log("totalQty", totalQty, findItem.rate_per_unit, sales.QTY);

        const lastSalesTransaction = await Sales_transaction.findOne(
          { gaushala_id: "01" },
          {},
          { sort: { sleep_number: -1 } }
        ).lean();
        let lastSleepNumber = lastSalesTransaction
          ? parseInt(lastSalesTransaction.sleep_number, 10)
          : 999;

        // Increment the last sleep_number by 1
        lastSleepNumber += 1;

        // Convert it back to a string and set the incremented sleep_number in dataToCreate
        const sleep_number = lastSleepNumber;

        let dataToCreate = {};
        dataToCreate = {
          gaushala_id: "01",

          department_id: findDept.department_id,

          department_name: findDept.value,

          item_name: findItem.item_name,

          qty: sales.QTY,

          rate: findDept.rate_per_unit,

          total: totalQty,

          mobile_number: remark,

          email: findDept.email_id,

          vehicle_number: sales.VEHICALE_NO,

          driver_name: sales.DRIVER_NAME,

          location: findDept.value,

          date: convertDateFormat(sales.Date),

          sleep_number: sleep_number,

          time: "14:43:20",
        };

        dataToCreate = new Sales_transaction(dataToCreate);
        let createdSales_transaction = await dbService.create(
          Sales_transaction,
          dataToCreate
        );
        successData.push(createdSales_transaction);
        console.log("*** success ****", DEP_ID, ITEM_ID);
      }
    }

    return res.success({ data: { errorData, successData } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

function convertDateFormat(inputDate) {
  // Split the input date into day, month, and year
  const [day, month, year] = inputDate.split("-");

  // Create a new Date object using the components
  const originalDate = new Date(`20${year}`, month - 1, day);

  // Extract the year, month, and day from the Date object
  const newYear = originalDate.getFullYear();
  const newMonth = (originalDate.getMonth() + 1).toString().padStart(2, "0");
  const newDay = originalDate.getDate().toString().padStart(2, "0");

  // Form the desired output format
  const outputDate = `${newYear}-${newMonth}-${newDay}`;

  return outputDate;
}

module.exports = {
  addBulkSales,
  addSales_transaction,
  findAllSales_transaction,
  getMonthlySalesSummary,
  getDashBoardSalesReports,
  getSales_transaction,
  getSales_transactionCount,
  updateSales_transaction,
  partialUpdateSales_transaction,
};
