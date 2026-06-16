const Report = require("../../../model/report");
const reportSchemaKey = require("../../../utils/validation/reportValidation");
const validation = require("../../../utils/validateRequest");
const sales_reportSchemaKey = require("../../../utils/validation/sales_reportValidation");
const dbService = require("../../../utils/dbService");
const ObjectId = require("mongodb").ObjectId;
const { subtractOneMonth, addZeroInMonth } = require("../../../utils/common");
const COW = require("../../../model/COW");
const dairy_product = require("../../../model/dairy_product");
const DairyMetrics = require("../../../model/DairyMetrics");
const default_variable = require("../../../model/default_variable");
const emp_attendance = require("../../../model/emp_attendance");
const emp_joining = require("../../../model/emp_joining");
const emp_leave = require("../../../model/emp_leave");
const employee = require("../../../model/employee");
const item_master = require("../../../model/item_master");
const milk_history = require("../../../model/milk_history");
const milk_usage = require("../../../model/milk_usage");
const milk = require("../../../model/milk");
const sales_item = require("../../../model/sales_items");
const sales_transaction = require("../../../model/sales_transaction");
const shedTransferHistory = require("../../../model/shedTransferHistory");
const stock = require("../../../model/stock");
const user = require("../../../model/user");
const vdr = require("../../../model/vdr");
const {
  isToday,
  parseDatabaseDate,
  isLatestDate,
  isBeforeLatestDatess,
  getTodayDate,
} = require("../../../utils/common");
const { func } = require("joi");
const { raw } = require("body-parser");
const sales_report = require("../../../model/sales_report");
const emailService = require("../../../services/email");
const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");
// const { gaushal_details_master_report } = require('./gaushal_details_masterController');
const Gaushal_details_master = require("../../../model/gaushal_details_master");
const shed = require("../../../model/shed");
const addReport = async (req, res) => {
  try {
    let dataToCreate = { ...(req.body || {}) };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      reportSchemaKey.schemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({
        message: `Invalid values in parameters, ${validateRequest.message}`,
      });
    }
    dataToCreate = new Report(dataToCreate);
    let createdReport = await dbService.create(Report, dataToCreate);
    return res.success({ data: createdReport });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};
const bulkInsertReport = async (req, res) => {
  try {
    if (
      req.body &&
      (!Array.isArray(req.body.data) || req.body.data.length < 1)
    ) {
      return res.badRequest();
    }
    let dataToCreate = [...req.body.data];
    let createdReports = await dbService.create(Report, dataToCreate);
    createdReports = { count: createdReports ? createdReports.length : 0 };
    return res.success({ data: { count: createdReports.count || 0 } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};
const findAllStockReport = async (req, res) => {
  try {
    let reqBody = {
      query: {},
      options: {
        select: [
          "item_id",
          "item_type",
          "date",
          "item_add_in_month",
          "item_out_in_month",
          "item_amount_add_in_month",
          "item_amount_out_in_month",
          "opening_qty_of_item",
          "closing_qty_of_item",
          "opening_amount",
          "closing_amount",
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

    let options = reqBody.options;
    let query = reqBody.query;
    query.gaushala_id = req.user.gaushala_id;
    const year = req.body.year;
    const startDate = `${year}-04-01`;
    const endDate = `${year + 1}-03-31`;
    query.date = {
      $gte: startDate,
      $lte: endDate,
    };

    // Check if the user has provided an item_name filter as an array
    if (Array.isArray(req.body.item_id) && req.body.item_id.length > 0) {
      // Add an item_name condition using $in to match any of the specified values
      query.item_id = {
        $in: req.body.item_id,
      };
    }

    const pipeline = [
      {
        $match: query,
      },
      {
        $lookup: {
          from: "item_masters",
          localField: "item_id",
          foreignField: "ItemId",
          as: "itemData",
        },
      },
      {
        $unwind: "$itemData",
      },
      {
        $match: {
          "itemData.gaushala_id": query.gaushala_id,
        },
      },
      {
        $project: {
          item_id: 1,
          item_name: "$itemData.ItemName",
          item_type: 1,
          date: 1,
          item_add_in_month: 1,
          item_out_in_month: 1,
          item_amount_add_in_month: 1,
          item_amount_out_in_month: 1,
          opening_qty_of_item: 1,
          closing_qty_of_item: 1,
          opening_amount: 1,
          closing_amount: 1,
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ];

    let validateRequest = validation.validateFilterWithJoi(
      reqBody,
      reportSchemaKey.findFilterKeys,
      Report.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof query === "object" && query !== null) {
      query = { ...query };
    }
    if (reqBody.isCountOnly) {
      let totalRecords = await dbService.count(Report, query);
      return res.success({ data: { totalRecords } });
    }
    if (reqBody && typeof options === "object" && options !== null) {
      options = { ...options };
    }
    // let foundReports = await dbService.findAll(Report, query, options);
    const foundReports = await Report.aggregate([pipeline]);

    if (!foundReports || foundReports.length == 0) {
      return res.recordNotFound();
    }
    return res.success({ data: foundReports });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

async function getMonthlyStockAmont(year, gaushala_id) {
  // Generate months from April to March for the financial year
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 4; // Start from April (4)
    const adjustedYear = month > 12 ? parseInt(year) + 1 : parseInt(year);
    const adjustedMonth = month > 12 ? month - 12 : month;
    return `${adjustedYear}-${adjustedMonth.toString().padStart(2, "0")}`;
  });

  const financialYearStart = `${year}-04-01`;
  const financialYearEnd = `${parseInt(year) + 1}-03-31`;

  // Get total_in_stock_amount from Stock collection directly
  // Only include incoming stock (vendor_id != gaushala_id)
  const stockFilter = {
    date: {
      $gte: financialYearStart,
      $lte: financialYearEnd,
    },
    gaushala_id: gaushala_id,
    isDeleted: false,
  };

  const monthlyStockData = await stock.aggregate([
    {
      $match: stockFilter,
    },
    {
      $addFields: {
        // Check if this is incoming stock (vendor_id != gaushala_id)
        isIncomingStock: { $ne: ["$vendor_id", "$gaushala_id"] }
      }
    },
    {
      $match: {
        isIncomingStock: true  // Only include incoming stock
      }
    },
    {
      $project: {
        month: { $substrCP: ["$date", 0, 7] },
        total_amount: 1,
      },
    },
    {
      $group: {
        _id: "$month",
        total_in_stock_amount: { $sum: "$total_amount" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Get opening and closing amounts from Report collection
  // Exclude 'Capital' item type as per business requirement
  const reportFilter = {
    date: {
      $gte: financialYearStart,
      $lte: financialYearEnd,
    },
    gaushala_id: gaushala_id,
    item_type: { $ne: "Capital" },
  };

  const monthlyReportData = await Report.aggregate([
    {
      $match: reportFilter,
    },
    {
      $project: {
        month: { $substrCP: ["$date", 0, 7] },
        opening_amount: "$opening_amount",
        closing_amount: "$closing_amount",
      },
    },
    {
      $group: {
        _id: "$month",
        opening_amount: { $sum: "$opening_amount" },
        closing_amount: { $sum: "$closing_amount" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const result = [];

  for (const month of months) {
    const foundStockMonth = monthlyStockData.find((data) => data._id === month);
    const foundReportMonth = monthlyReportData.find((data) => data._id === month);

    const monthData = {
      _id: month,
      total_in_stock_amount: foundStockMonth ? foundStockMonth.total_in_stock_amount : 0,
      opening_amount: foundReportMonth ? foundReportMonth.opening_amount : 0,
      closing_amount: foundReportMonth ? foundReportMonth.closing_amount : 0,
    };

    console.log("Monthly Stock Data for: ", month, " => Stock Amount:", monthData.total_in_stock_amount);

    result.push(monthData);
  }

  return result;
}

const findAllSales_report = async (req, res) => {
  try {
    let options = {};
    let query = {};
    query.gaushala_id = req.user.gaushala_id;

    console.log("Request Body: ", req.body);

    // Calculate the start and end dates for the financial year
    const financialYearStart = `${req.body.year}-04-01`;
    const financialYearEnd = `${req.body.year + 1}-03-31`;

    console.log("Request Body: ", financialYearStart);
    console.log("Request Body: ", financialYearEnd);
    query.date = {
      $gte: financialYearStart,
      $lte: financialYearEnd,
    };

    const getAllCalculation = await getAllCalculations({
      query: query,
      options: options,
      year: req.body.year,
      gaushala_id: req.user.gaushala_id,
    });

    return res.success({ data: getAllCalculation });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const findAllSales_report1 = async (req, res) => {
  try {
    let options = {};
    let query = {};
    query.gaushala_id = req.user.gaushala_id;

    console.log("Request Body: ", req.body);

    // Calculate the start and end dates for the financial year
    const financialYearStart = `${req.body.year}-04-01`;
    const financialYearEnd = `${req.body.year + 1}-03-31`;

    console.log("Request Body: ", financialYearStart);
    console.log("Request Body: ", financialYearEnd);
    query.date = {
      $gte: financialYearStart,
      $lte: financialYearEnd,
    };

    // let foundSales_reports = await dbService.findAll(sales_report, query, options);

    // if (!foundSales_reports || !foundSales_reports.length === 0) {
    //   return res.recordNotFound();
    // }

    // const getMonthlyExpence = await getMonthlyStockAmont(req.body.year, req.user.gaushala_id);

    const getAllCalculation = await getAllCalculations({
      query: query,
      options: options,
      year: req.body.year,
      gaushala_id: req.user.gaushala_id,
    });

    return res.success({ data: getAllCalculation });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

async function getAllCalculations({ query, options, year, gaushala_id }) {
  try {
    console.log("Query: ", query);
    console.log("Options: ", options);
    console.log("year: ", year);
    console.log("gaushala_id: ", gaushala_id);
    let foundSales_reports = await dbService.findAll(
      sales_report,
      query,
      options
    );

    console.log("Found Sales Reports: ", foundSales_reports);

    if (!foundSales_reports || !foundSales_reports.length === 0) {
      return res.recordNotFound();
    }

    const getMonthlyExpence = await getMonthlyStockAmont(year, gaushala_id);

    return { foundSales_reports, getMonthlyExpence };
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
}



async function getReportLastMonthDataCreated(
  currentYear,
  currentMonth,
  gaushala_id,
  item_id
) {
  let resultDates = subtractOneMonth(currentMonth, currentYear);

  currentMonth = resultDates.newMonth;
  currentYear = resultDates.newYear;

  currentMonth = addZeroInMonth(currentMonth);

  const matchStage = {
    date: {
      $regex: `^${currentYear}-${currentMonth}`, // Matches '2023-10-XX' format
    },
    gaushala_id: gaushala_id,
    isDeleted: false,
  };

  if (item_id !== "") {
    matchStage.item_id = item_id;
  }
  var data = await Report.aggregate([
    {
      $match: matchStage,
    },
  ])
  console.log("Last Month Data: ", data);

  return data;
}

async function getCurrentMonthStock(year, month, gaushala_id, item_id) {
  month = addZeroInMonth(month);

  const matchStage = {
    date: {
      $regex: `^${year}-${month}`, // Matches '2023-10-XX' format
    },
    gaushala_id: gaushala_id,
    isDeleted: false,
  };

  if (item_id !== "") {
    matchStage.item_id = item_id;
  }

  var data = await stock.aggregate([
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: {
          item_id: "$item_id",
          vendor_id: "$vendor_id",
          RFO_no: "$RFO_no",
          //vendor_id: { $first: "$vendor_id" },
          bill_no: "$bill_no",
          // item_id: { $first: "$item_id" },
          expence_type: "$expence_type",
          qty: "$qty",
          kg_per_unit: "$kg_per_unit",
          rate_per_unit: "$rate_per_unit",
          entry_by: "$entry_by",
          remark: "$remark",
          isStock: "$isStock",
          date: "$date",
          gaushala_id: "$gaushala_id",
        },
        // RFO_no: { $first: "$RFO_no" },
        // //vendor_id: { $first: "$vendor_id" },
        // bill_no: { $first: "$bill_no" },
        // // item_id: { $first: "$item_id" },
        // expence_type: { $first: "$expence_type" },
        // qty: { $first: "$qty" },
        // kg_per_unit: { $first: "$kg_per_unit" },
        // rate_per_unit: { $first: "$rate_per_unit" },
        // entry_by: { $first: "$entry_by" },
        // remark: { $first: "$remark" },
        // isStock: { $first: "$isStock" },
        // date: { $first: "$date" },
        // gaushala_id: { $first: "$gaushala_id" }, // Includ
        totalWtOrQty: { $sum: "$totalWtOrQty" },
        total_amount: { $sum: "$total_amount" },
      },
    },
    {
      $project: {
        _id: 0,
        gaushala_id: "$_id.gaushala_id", // Include gaushala_id in the output
        vendor_id: "$_id.vendor_id",
        item_id: "$_id.item_id",
        expence_type: "$_id.expence_type",
        date: 1,
        totalWtOrQty: 1,
        total_amount: 1,
        RFO_no: 1,
      },
    },
  ]);

  console.log("Current Month Stock Data: ", data);

  return data;
}

const createAllReport = async (req, res) => {
  try {
    console.log("Create All Report Function Called");
    const gaushala_list = ["01", "02", "03", "04", "05"];

    const delayBetweenFunctions = 300000; // 5 minutes in milliseconds

    for (let i = 0; i < gaushala_list.length; i++) {
      console.log(`Processing gaushala_id: ${gaushala_list[i]}`);
      let gaushala_id = gaushala_list[i];
      const todayDate = getTodayDate();
      const dateParts = todayDate.split("-");
      const curMonth = dateParts[1];
      const curYear = dateParts[0];

      let month = curMonth;
      let year = curYear;

      console.log("📊 Running stock report job 📊");
      await stockReport(year, month, gaushala_id, "");
      console.log("📊 Completed stock report job 📊");

      console.log("📝 Running sales report job 📝");
      await salesReport(year, month, gaushala_id);
      console.log("📝 Completed sales report job 📝");

      console.log("🐮 Running gaushala detail report job 🐮");
      await gaushal_details_master_report(year, month, gaushala_id);
      console.log("🐮 Completed gaushala detail job 🐮");
    }
    return;

    //return res.success({ data: "done" });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

async function stockReport(year, month, gaushala_id, item_id) {
  const todayDate = getTodayDate();
  const dateParts = todayDate.split("-");
  const curMonth = dateParts[1];
  const curYear = dateParts[0];
  const curDate = dateParts[2];
  let getDataOfCurrentMonthStock = [];
  let checkReportCurrentMonthDataCreated = [];
  let report = {};

  // Fetch all records from the item_master collection
  // const itemMasterRecords = await item_master.find({ gaushala_id: gaushala_id, isStock: true });

  console.log("Generating stock report for Gaushala ID ID:", gaushala_id);

  const itemMasterRecords = await item_master.find({
    gaushala_id: gaushala_id,
    isDeleted: false,
    isStock: true,
  });

  console.log("Item Master Records Length: ", itemMasterRecords.length);

  if (year > curYear || (year >= curYear && month > curMonth)) {
    return; // Stop the recursion when we reach the current month/year.
  }

  let monthlyDate = "";
  let tempMonth = month.toString();

  console.log("Processing Year-Month: ", year, month);

  if (tempMonth.length == 1) {
    monthlyDate = `${year}-0${month}-01`;
  } else {
    monthlyDate = `${year}-${month}-01`;
  }

  // check data is created already or not
  checkReportCurrentMonthDataCreated = await getReportCurrentMonthDataCreated(
    year,
    month,
    gaushala_id,
    item_id
  );

  let getLastMonthReport = await getReportLastMonthDataCreated(
    year,
    month,
    gaushala_id,
    item_id
  );

  const itemMap = new Map();

  // get data of stock from Stocks collection
  getDataOfCurrentMonthStock = await getCurrentMonthStock(
    year,
    month,
    gaushala_id,
    item_id
  );

  if (checkReportCurrentMonthDataCreated.length == 0) {
    for (const itemMasterRecord of itemMasterRecords) {
      if (
        (item_id !== "" && itemMasterRecord.ItemId === item_id) ||
        item_id === ""
      ) {
        const report = checkReportCurrentMonthDataCreated.find(
          (lastReport) => lastReport.item_id === itemMasterRecord.ItemId
        );

        if (report == undefined) {
          let report = new Report({
            item_id: itemMasterRecord.ItemId,
            item_type: itemMasterRecord.ExpenceType,
            date: monthlyDate,

            gaushala_id: gaushala_id,

            item_add_in_month: 0,

            item_out_in_month: 0,

            item_amount_add_in_month: 0,

            average_price_of_item: 0,

            item_amount_out_in_month: 0,

            opening_qty_of_item: 0,

            closing_qty_of_item: 0,

            opening_amount: 0,

            closing_amount: 0,
          });
          console.log("Creating Report for Item ID: ", itemMasterRecord.ItemId);
          await dbService.create(Report, report);
          //await report.save();
        }
        // else {
        // }
      }
    }

    checkReportCurrentMonthDataCreated = await getReportCurrentMonthDataCreated(
      year,
      month,
      gaushala_id,
      item_id
    );
    // console.log("checkReportCurrentMonthDataCreated 2: ", checkReportCurrentMonthDataCreated.length)
    // }

    getDataOfCurrentMonthStock.forEach(async (stockItem) => {
      if (item_id === "" || item_id === stockItem.item_id) {
        let reportItem = {};

        if (itemMap.has(stockItem.item_id)) {
          reportItem = itemMap.get(stockItem.item_id);
        } else {
          try {
            reportItem = checkReportCurrentMonthDataCreated.find(
              (report) => report.item_id === stockItem.item_id
            );

            // console.log("Report Item Undefined Check Point 🎉🎉🎉: ", stockItem.item_id, reportItem.item_id);

            reportItem.item_add_in_month = 0;
            reportItem.item_amount_add_in_month = 0;
            reportItem.item_out_in_month = 0;
            reportItem.item_amount_out_in_month = 0;
            reportItem.average_price_of_item = 0;
            reportItem.opening_qty_of_item = 0;
            reportItem.closing_qty_of_item = 0;
            reportItem.opening_amount = 0;
            reportItem.closing_amount = 0;
          } catch (error) {
            // console.log("💥💥💥Report Item Found Undefined 💥💥💥: ", stockItem);
          }
        }

        // Find the corresponding item in checkReportCurrentMonthDataCreated
        const lastReport = getLastMonthReport.find(
          (lastReport) => lastReport.item_id === reportItem.item_id
        );

        if (stockItem.vendor_id != stockItem.gaushala_id) {
          // Update the item_add_in_month field with the value from totalWtOrQty
          //console.log("reportItem ID : ", reportItem.item_id, stockItem.totalWtOrQty, stockItem.total_amount)
          reportItem.item_add_in_month =
            parseFloat(reportItem.item_add_in_month) + stockItem.totalWtOrQty;
          reportItem.item_amount_add_in_month =
            parseFloat(reportItem.item_amount_add_in_month) +
            stockItem.total_amount;
          reportItem.item_out_in_month = reportItem.item_out_in_month;
          reportItem.item_amount_out_in_month =
            reportItem.item_amount_out_in_month;
        } else {
          reportItem.item_add_in_month = reportItem.item_add_in_month;
          reportItem.item_amount_add_in_month =
            reportItem.item_amount_add_in_month;
          reportItem.item_out_in_month =
            parseFloat(reportItem.item_out_in_month) + stockItem.totalWtOrQty;
          reportItem.item_amount_out_in_month =
            parseFloat(reportItem.item_amount_out_in_month) +
            stockItem.total_amount++;
        }

        if (lastReport == undefined) {
          reportItem.opening_amount = 0;
        } else {
          reportItem.opening_amount = lastReport.closing_amount;
          reportItem.opening_qty_of_item = lastReport.closing_qty_of_item;
        }
        const report = itemMasterRecords.find(
          (record) => record.ItemId === reportItem.item_id
        );
        // total sum balance
        const total_balance =
          parseFloat(reportItem.opening_amount) +
          parseFloat(reportItem.item_amount_add_in_month);

        // total sum qty
        const total_qty =
          parseFloat(reportItem.opening_qty_of_item) +
          parseFloat(reportItem.item_add_in_month);

        //get Avg price
        const avg_price = total_qty === 0 ? 0 : total_balance / total_qty;

        reportItem.average_price_of_item = avg_price;

        // out bal
        const out_balance =
          parseFloat(reportItem.item_out_in_month) * avg_price;

        //💥💥💥 null check

        // const isStock = report?.isStock;

        // if (report === undefined || report === null) {
        //   console.log('Report is undefined or null:', report, reportItem.item_id);
        // } else if (typeof report.isStock === 'undefined') {
        //   console.log('isStock is undefined in report:', report);
        // } else {
        //   console.log('isStock:', isStock);
        // }

        //💥💥💥 null check

        if (
          isNaN(total_balance) ||
          isNaN(out_balance) ||
          report.isStock == false
        ) {
          reportItem.closing_amount = 0;
        } else {
          reportItem.closing_amount =
            parseFloat(total_balance) - parseFloat(out_balance);
        }

        // set closing qty
        if (
          isNaN(total_qty) ||
          isNaN(reportItem.item_out_in_month) ||
          report.isStock == false
        ) {
          reportItem.closing_qty_of_item = 0;
        } else {
          reportItem.closing_qty_of_item =
            total_qty - parseFloat(reportItem.item_out_in_month);
        }
        itemMap.set(reportItem.item_id, reportItem);
      }
    });

    for (const itemMasterRecord of itemMasterRecords) {
      if (item_id === "" || item_id === itemMasterRecord.ItemId) {
        if (!itemMap.has(itemMasterRecord.ItemId)) {
          checkReportCurrentMonthDataCreated =
            await getReportCurrentMonthDataCreated(
              year,
              month,
              gaushala_id,
              item_id
            );

          const lastReport = getLastMonthReport.find(
            (lastReport) => lastReport.item_id === itemMasterRecord.ItemId
          );
          let reportItem = checkReportCurrentMonthDataCreated.find(
            (report) => report.item_id === itemMasterRecord.ItemId
          );

          if (lastReport != undefined) {
            const report = itemMasterRecords.find(
              (record) => record.ItemId === reportItem.item_id
            );

            reportItem = {
              item_id: itemMasterRecord.ItemId,
              item_type: itemMasterRecord.ExpenceType,
              date: monthlyDate,

              gaushala_id: gaushala_id,

              item_add_in_month: 0,

              item_out_in_month: 0,

              item_amount_add_in_month: 0,

              average_price_of_item:
                report.isStock === true ? lastReport.average_price_of_item : 0,

              item_amount_out_in_month: 0,

              opening_qty_of_item: lastReport.closing_qty_of_item,

              closing_qty_of_item: lastReport.closing_qty_of_item,

              opening_amount: lastReport.closing_amount,

              closing_amount: lastReport.closing_amount,
            };
          } 
          /*
        else {
          let reportItem = {
            item_id: itemMasterRecord.ItemId,
            item_type: itemMasterRecord.ExpenceType,
            date: monthlyDate,

            gaushala_id: gaushala_id,

            item_add_in_month: 0,

            item_out_in_month: 0,

            item_amount_add_in_month: 0,

            average_price_of_item: 0,

            item_amount_out_in_month: 0,

            opening_qty_of_item: 0,

            closing_qty_of_item: 0,

            opening_amount: 0,

            closing_amount: 0,
          };

          itemMap.set(reportItem.item_id, reportItem);
        }*/
          itemMap.set(reportItem.item_id, reportItem);
        }
      }
    }

    for (const [key, value] of itemMap) {
      await dbService.updateOne(
        Report,
        { item_id: value.item_id, date: value.date, gaushala_id: gaushala_id },
        value
      );
    }

    month++;

    if (month > 12) {
      month = 1;
      year++;
    }
  }
  //await new Promise((resolve) => setTimeout(resolve, 10000)); // Simulate an async operation (e.g., waiting for 10 seconds).

  console.log("Moving to next month...", item_id);

  // return stockReport(year, month, gaushala_id, item_id);
}
async function getReportCurrentMonthDataCreated(
  currentYear,
  currentMonth,
  gaushala_id,
  item_id
) {
  currentMonth = addZeroInMonth(currentMonth);

  console.log("Current Month: ", currentMonth);

  const matchStage = {
    date: {
      $regex: `^${currentYear}-${currentMonth}`, // Matches '2023-10-XX' format
    },
    gaushala_id: gaushala_id,
    isDeleted: false,
  };

  console.log("Match Stage: ", item_id);

  if (item_id !== "") {
    matchStage.item_id = item_id;
  }

  console.log("Match Stage Final: ", matchStage);


  var data = await Report.aggregate([
    {
      $match: matchStage,
    },
  ]);

  console.log("Data Length: ", data);

  return data;
}

// Monthly and item wise
const salesReportMonthlyItems = async (req, res) => {
  try {
    let query = {};
    query.gaushala_id = req.user.gaushala_id;

    const reqYear = req.body.reqYear;
    const reqMonth = req.body.reqMonth;

    query.date = {
      $regex: `^${reqYear}-${reqMonth}-\\d{2}`, // Matches '2023-10-XX' format
    };

    if (
      Array.isArray(req.body.department_id) &&
      req.body.department_id.length > 0
    ) {
      // Add a department_id condition using $in to match any of the specified values
      query.department_id = {
        $in: req.body.department_id,
      };
    }

    if (Array.isArray(req.body.item_name) && req.body.item_name.length > 0) {
      // Add an item_name condition using $in to match any of the specified values
      query.item_name = {
        $in: req.body.item_name,
      };
    }

    const pipeline = [
      {
        $match: query,
      },
      {
        $group: {
          _id: {
            gaushala_id: "$gaushala_id",
            item_name: "$item_name",
            rate: "$rate",
          },
          qty: { $sum: "$qty" },
          total: { $sum: "$total" },
        },
      },
      {
        $project: {
          _id: 0,
          gaushala_id: "$_id.gaushala_id",
          item_name: "$_id.item_name",
          rate: "$_id.rate",
          date: 1,
          qty: 1,
          total: 1,
        },
      },
      {
        $replaceRoot: { newRoot: "$$ROOT" },
      },
    ];

    const sales_transactions = await sales_transaction.aggregate(pipeline);

    if (!sales_transactions || sales_transactions.length === 0) {
      return res.recordNotFound();
    }

    return res.success({ data: sales_transactions });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

// Monthly and department wise
const salesReportMonthlyDepartment = async (req, res) => {
  try {
    let query = {};
    query.gaushala_id = req.user.gaushala_id;

    const year = req.body.year;
    const startDate = `${year}-04-01`;
    const endDate = `${parseInt(year) + 1}-03-31`;
    query.date = {
      $gte: startDate,
      $lte: endDate,
    };

    if (
      Array.isArray(req.body.department_id) &&
      req.body.department_id.length > 0
    ) {
      query.department_id = {
        $in: req.body.department_id,
      };
    }

    if (Array.isArray(req.body.item_name) && req.body.item_name.length > 0) {
      query.item_name = {
        $in: req.body.item_name,
      };
    }

    const pipeline = [
      {
        $match: query,
      },
      {
        $group: {
          _id: { $substr: ["$date", 0, 7] },
          total: { $sum: "$total" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          total: 1,
        },
      },
      {
        $sort: { date: 1 },
      },
    ];

    // Generate an array of months from April to March for the financial year
    const months = Array.from({ length: 12 }, (_, i) => {
      const month = i + 4; // Start from April (4)
      const adjustedYear = month > 12 ? year + 1 : year;
      const adjustedMonth = month > 12 ? month - 12 : month;
      return `${adjustedYear}-${adjustedMonth.toString().padStart(2, "0")}`;
    });

    const sales_transactions = await sales_transaction.aggregate(pipeline);

    // Left join with all months and assign total as 0 for missing months
    const result = months.map((month) => {
      const match = sales_transactions.find((item) => item.date === month) || {
        total: 0,
      };
      return { date: month, total: match.total };
    });

    return res.success({ data: result });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

// Monthly and item wise
const salesReportAllDepartmentsMonthly = async (req, res) => {
  try {
    let query = {};
    query.gaushala_id = req.user.gaushala_id;

    const reqYear = req.body.reqYear;
    const reqMonth = req.body.reqMonth;

    query.date = {
      $regex: `^${reqYear}-${reqMonth}-\\d{2}`, // Matches '2023-10-XX' format
    };

    if (
      Array.isArray(req.body.department_id) &&
      req.body.department_id.length > 0
    ) {
      // Add a department_id condition using $in to match any of the specified values
      query.department_id = {
        $in: req.body.department_id,
      };
    }

    if (Array.isArray(req.body.item_name) && req.body.item_name.length > 0) {
      // Add an item_name condition using $in to match any of the specified values
      query.item_name = {
        $in: req.body.item_name,
      };
    }

    const pipeline = [
      {
        $match: query,
      },
      {
        $lookup: {
          from: "departments",
          let: { departmentId: "$department_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$department_id", "$$departmentId"] },
                    { $eq: ["$isDeleted", false] },
                    { $eq: ["$gaushala_id", query.gaushala_id] },
                  ],
                },
              },
            },
          ],
          as: "departmentsData",
        },
      },
      {
        $unwind: "$departmentsData",
      },
      {
        $group: {
          _id: {
            gaushala_id: "$gaushala_id",
            department_id: "$department_id",
            department_name: "$departmentsData.value",
            // rate: '$rate',
          },
          // qty: { $sum: '$qty' },
          total: { $sum: "$total" },
        },
      },

      {
        $project: {
          _id: 0,
          gaushala_id: "$_id.gaushala_id",
          department_id: "$_id.department_id",
          department_name: "$_id.department_name",
          date: 1,
          qty: 1,
          total: 1,
        },
      },
      {
        $sort: {
          department_id: 1,
        },
      },
      {
        $replaceRoot: { newRoot: "$$ROOT" },
      },
    ];

    const sales_transactions = await sales_transaction.aggregate(pipeline);

    if (!sales_transactions || sales_transactions.length === 0) {
      return res.recordNotFound();
    }

    return res.success({ data: sales_transactions });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

//get current month sales report
function checkCurrnetMonthSalesReportRecordExist(year, month, gaushala_id) {
  month = addZeroInMonth(month);

  return sales_report.aggregate([
    {
      $match: {
        date: {
          $regex: `^${year}-${month}-\\d{2}`, // Matches '2023-10-XX' format
        },
        gaushala_id: gaushala_id,
      },
    },
  ]);
}

//get current month sales data
function getCurrentMonthSales(year, month, gaushala_id) {
  month = addZeroInMonth(month);

  return sales_transaction.aggregate([
    {
      $match: {
        date: {
          $regex: `^${year}-${month}-\\d{2}`, // Matches '2023-10-XX' format
        },
        gaushala_id: gaushala_id,
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: {
          gaushala_id: "$gaushala_id",
        },
        total: { $sum: "$total" },
      },
    },
    {
      $project: {
        _id: 0,
        gaushala_id: "$_id.gaushala_id",
        total: 1,
      },
    },
  ]);
}
// Yearly
async function salesReport(year, month, gaushala_id) {
  const todayDate = await getTodayDate();
  const dateParts = todayDate.split("-");
  const curMonth = dateParts[1];
  const curYear = dateParts[0];
  const curDate = dateParts[2];
  let getDataOfCurrentMonthStock = [];
  let checkCurrnetMonthSalesReportRecord = [];
  console.log("current date === ", todayDate);

  if (year > curYear || (year >= curYear && month > curMonth)) {
    return; // Stop the recursion when we reach the current month/year.
  }

  let createdDate = "";
  let tempMonth = month.toString();

  if (tempMonth.length == 1) {
    createdDate = `${year}-0${month}-01`;
  } else {
    createdDate = `${year}-${month}-01`;
  }

  console.log("current date === ", createdDate);

  tempMonth = addZeroInMonth(month);

  let report = {};

  let filter = {
    date: {
      $regex: `^${year}-${tempMonth}-\\d{2}`, // Matches '2023-10-XX' format
    },
    gaushala_id: gaushala_id,
  };

  checkCurrnetMonthSalesReportRecord =
    await checkCurrnetMonthSalesReportRecordExist(year, month, gaushala_id);

  const getSalesCurrentMonthData = await getCurrentMonthSales(
    year,
    month,
    gaushala_id
  );

  if (checkCurrnetMonthSalesReportRecord.length === 0) {
    report = new sales_report({
      gaushala_id: gaushala_id,
      date: createdDate,
      total_sales_amount: 0,
    });

    await report.save();
    checkCurrnetMonthSalesReportRecord =
      await checkCurrnetMonthSalesReportRecordExist(year, month, gaushala_id);
  }

  if (!getSalesCurrentMonthData || getSalesCurrentMonthData.length !== 0) {
    checkCurrnetMonthSalesReportRecord[0].gaushala_id =
      getSalesCurrentMonthData[0].gaushala_id;
    checkCurrnetMonthSalesReportRecord[0].date = createdDate;
    checkCurrnetMonthSalesReportRecord[0].total_sales_amount =
      getSalesCurrentMonthData[0].total;
    await dbService.updateOne(
      sales_report,
      filter,
      checkCurrnetMonthSalesReportRecord[0]
    );
  }

  month++;

  if (month > 12) {
    month = 1;
    year++;
  }
  await new Promise((resolve) => setTimeout(resolve, 10000)); // Simulate an async operation (e.g., waiting for 10 seconds).

  return salesReport(year, month, gaushala_id);
}

// Cow Report
const cattleReport2 = async (req, res) => {
  try {
    // Specify the year and month you want to query
    const targetYear = req.body.year; // Replace with your target year
    const targetMonth = 12; // Replace with your target month

    // Define the pipeline for aggregation
    const pipeline = [
      {
        $match: {
          $expr: {
            $eq: [{ $year: "$createdAt" }, targetYear],
          },
          gaushala_id: req.user.gaushala_id,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ];

    // Execute the aggregation
    const result = await COW.aggregate(pipeline);

    // Calculate the cumulative counts
    const cumulativeCounts = [];
    let cumulativeCount = 0;
    let cumulativeCountExit = 0;

    for (const entry of result) {
      const monthYear = entry._id;
      const count = entry.count;

      cumulativeCount += count;

      cumulativeCounts.push({ [monthYear]: cumulativeCount });
    }

    // Define a new pipeline to subtract records with send_died_date not equal to "NA"
    const subtractPipeline = [
      {
        $match: {
          $expr: {
            $eq: [{ $year: "$createdAt" }, targetYear],
          },
          send_died_date: { $ne: "NA" },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ];

    // Execute the subtraction aggregation
    const subtractResult = await COW.aggregate(subtractPipeline);
    const tempSubtractResult = [];

    for (const entry of subtractResult) {
      const monthYear = entry._id;
      const count = entry.count;

      cumulativeCountExit += count;

      tempSubtractResult.push({ _id: monthYear, count: cumulativeCountExit });
    }

    for (const entry of tempSubtractResult) {
      const monthYear = entry._id;
      const count = entry.count;

      const index = cumulativeCounts.findIndex(
        (item) => Object.keys(item)[0] === monthYear
      );

      if (index !== -1) {
        cumulativeCounts[index][monthYear] -= count;
      }
    }

    // Handle cases where a month is not in subtractResult but is in cumulativeCounts
    for (let i = 1; i < cumulativeCounts.length; i++) {
      const currentMonth = Object.keys(cumulativeCounts[i])[0];
      const previousMonth = Object.keys(cumulativeCounts[i - 1])[0];

      if (
        !tempSubtractResult.find((item) => item._id === currentMonth) &&
        currentMonth !== targetMonth
      ) {
        cumulativeCounts[i][currentMonth] =
          cumulativeCounts[i - 1][previousMonth];
      }
    }

    if (cumulativeCounts.length === 0 || !cumulativeCounts) {
      return res.recordNotFound();
    }

    const transformedArray = cumulativeCounts.map((item) => {
      const date = Object.keys(item)[0]; // Extract the date
      const count = item[date]; // Extract the count

      return {
        date: date,
        count: count,
      };
    });

    return res.success({ data: transformedArray });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const cattleReport3 = async (req, res) => {
  try {
    const targetYear = req.body.year; // Replace with your target year

    // Find the oldest year in the database
    const oldestYearResult = await COW.aggregate([
      {
        $group: {
          _id: null,
          oldestYear: { $min: { $year: "$createdAt" } },
        },
      },
    ]);

    const oldestYear =
      oldestYearResult.length > 0 ? oldestYearResult[0].oldestYear : targetYear;

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // Months are zero-indexed

    // Generate an array of months based on the user input
    const monthsInYear = [];
    for (
      let month = 1;
      month <= (targetYear === currentYear ? currentMonth : 12);
      month++
    ) {
      monthsInYear.push(`${targetYear}-${month.toString().padStart(2, "0")}`);
    }

    // Define the pipeline for aggregation
    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(`${oldestYear}-01-01T00:00:00.000Z`),
            $lte: new Date(`${targetYear}-12-31T23:59:59.999Z`),
          },
          gaushala_id: req.user.gaushala_id,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ];

    // Execute the aggregation
    const result = await COW.aggregate(pipeline);

    // Create a map to store cumulative counts
    const cumulativeCountsMap = new Map();

    // Initialize cumulative count
    let cumulativeCount = 0;

    // Process the aggregation result
    for (const entry of result) {
      const monthYear = entry._id;
      const count = entry.count;

      cumulativeCount += count;
      cumulativeCountsMap.set(monthYear, cumulativeCount);
    }

    // Fill in missing months with cumulative counts from previous month
    for (let i = 0; i < monthsInYear.length; i++) {
      const currentMonth = monthsInYear[i];
      if (!cumulativeCountsMap.has(currentMonth)) {
        const previousMonth = i > 0 ? monthsInYear[i - 1] : null;
        const count = cumulativeCountsMap.get(previousMonth) || 0;
        cumulativeCountsMap.set(currentMonth, count);
      }
    }

    // Convert the map to an array of objects
    const transformedArray = Array.from(
      cumulativeCountsMap,
      ([date, count]) => ({
        date,
        count,
      })
    );

    return res.success({ data: transformedArray });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const cattleReport = async (req, res) => {
  try {
    const targetYear = req.body.year; // Replace with your target year

    // Find the oldest year in the database
    const oldestYearResult = await COW.aggregate([
      {
        $project: {
          dob: 1, // Ensure that the 'date' field is included in the projection
        },
      },
      {
        $addFields: {
          parsedDate: {
            $dateFromString: {
              dateString: "$dob",
              format: "%Y-%m-%d", // Specify the format of your date
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          oldestYear: { $min: { $year: "$parsedDate" } },
        },
      },
    ]);

    const oldestYear =
      oldestYearResult.length > 0
        ? oldestYearResult[0].oldestYear
        : targetYear + 1;

    // Generate months from April to March for the financial year
    const monthsInYear = [];
    const startMonth = 1; // April
    const endMonth = 3; // March

    for (
      let month = startMonth;
      month <= endMonth + 12 * (targetYear + 1 - oldestYear);
      month++
    ) {
      const adjustedMonth = ((month - 1) % 12) + 1;
      const adjustedYear = oldestYear + Math.floor((month - 1) / 12);
      monthsInYear.push(
        `${adjustedYear}-${adjustedMonth.toString().padStart(2, "0")}`
      );
    }

    // Define the pipeline for aggregation
    const pipeline = [
      {
        $match: {
          dob: {
            $exists: true, // Ensure 'dob' field exists
            $ne: null, // Ensure 'dob' is not null
          },
          gaushala_id: req.user.gaushala_id,
          type: {
            $nin: ["Donate", "Died", "SEMEN"],
          },
          shed_id: {
            $nin: ["NA", "DONATION", "DIED"],
          },
        },
      },
      {
        $project: {
          monthYear: {
            $dateToString: {
              format: "%Y-%m",
              date: {
                $dateFromString: { dateString: "$dob", format: "%Y-%m-%d" },
              },
            },
          },
          sendDiedDate: {
            $cond: {
              if: { $eq: ["$send_died_date", "NA"] },
              then: null,
              else: "$send_died_date",
            },
          },
        },
      },
      {
        $addFields: {
          excludeCount: {
            $cond: {
              if: {
                $and: [
                  {
                    $regexMatch: {
                      input: "$sendDiedDate",
                      regex: /^\d{4}-\d{2}-\d{2}$/, // Check if sendDiedDate is in 'yyyy-mm-dd' format
                    },
                  },
                  {
                    $ne: ["$sendDiedDate", "NA"], // Check if sendDiedDate is not 'NA'
                  },
                ],
              },
              then: 1,
              else: 0,
            },
          },
        },
      },
      // Modify the $group stage as follows:
      {
        $group: {
          _id: "$monthYear",
          count: { $sum: { $cond: [{ $eq: ["$excludeCount", 0] }, 1, 0] } },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ];

    // Execute the aggregation
    const result = await COW.aggregate(pipeline);

    // Create a map to store cumulative counts
    const cumulativeCountsMap = new Map();

    // Initialize cumulative count
    let cumulativeCount = 0;
    let lastAvailableMonth = null;
    // Iterate through all months in monthsInYear
    for (const currentMonth of monthsInYear) {
      const entry = result.find((item) => item._id === currentMonth);
      const count = entry ? entry.count : 0;
      cumulativeCount += count;

      // Update cumulative count for the current month
      cumulativeCountsMap.set(currentMonth, cumulativeCount);
    }

    // Convert the map to an array of objects
    const transformedArray = Array.from(
      cumulativeCountsMap,
      ([date, count]) => ({
        date,
        count,
      })
    );
    return res.success({ data: transformedArray });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const cattleReportMonthlyAddedCounts = async (req, res) => {
  try {
    const targetYear = req.body.year; // Replace with your target year

    // Find the oldest year in the database
    const oldestYearResult = await COW.aggregate([
      {
        $group: {
          _id: null,
          oldestYear: { $min: { $year: "$createdAt" } },
        },
      },
    ]);

    const oldestYear =
      oldestYearResult.length > 0 ? oldestYearResult[0].oldestYear : targetYear;

    // Generate an array of months based on the user input
    const monthsInYear = [];
    for (
      let month = 1;
      month <=
      (targetYear === new Date().getFullYear()
        ? new Date().getMonth() + 1
        : 12);
      month++
    ) {
      monthsInYear.push(`${targetYear}-${month.toString().padStart(2, "0")}`);
    }

    // Define the pipeline for aggregation
    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(`${oldestYear}-01-01T00:00:00.000Z`),
            $lte: new Date(`${targetYear}-12-31T23:59:59.999Z`),
          },
          gaushala_id: req.user.gaushala_id,
          type: {
            $nin: ["DONATE", "DIED", "SEMEN"],
          },
        },
      },
      {
        $project: {
          monthYear: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        },
      },
      {
        $group: {
          _id: "$monthYear",
          count: { $sum: 1 }, // Count the number of documents for each month
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ];

    // Execute the aggregation
    const result = await COW.aggregate(pipeline);

    // Convert the result to an array of objects
    const transformedArray = result.map((entry) => ({
      date: entry._id,
      count: entry.count,
    }));

    return res.success({ data: transformedArray });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const milkReport = async (req, res) => {
  try {
    const year = req.body.year;

    // Calculate the start and end dates for the financial year
    const financialYearStart = `${year}-04-01`;
    const financialYearEnd = `${year + 1}-03-31`;

    const pipeline = [
      {
        $match: {
          date: {
            $gte: financialYearStart,
            $lte: financialYearEnd,
          },
          gaushala_id: req.user.gaushala_id,
        },
      },
      {
        $addFields: {
          date: {
            $dateFromString: {
              dateString: "$date",
              format: "%Y-%m-%d",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          month: {
            $dateToString: {
              format: "%Y-%m",
              date: "$date",
            },
          },
          total_milk: 1,
        },
      },
      {
        $group: {
          _id: "$month",
          total_milk: { $sum: "$total_milk" },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          total_milk: 1,
        },
      },
      {
        $sort: {
          month: 1,
        },
      },
    ];

    const milk_history_data = await milk_history.aggregate(pipeline);

    if (milk_history_data.length === 0 || !milk_history_data) {
      return res.recordNotFound();
    }

    return res.success({ data: milk_history_data });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const getItemStock = async (req, res) => {
  // try {

  const todayDate = getTodayDate();
  const dateParts = todayDate.split("-");
  const curMonth = dateParts[1];
  const curYear = dateParts[0];

  const year = req.body.year;
  const month = req.body.month;
  const gaushala_id = req.user.gaushala_id;
  const item_id = req.body.item_id;
  console.log("item id in get item stock : ", item_id);
  await stockReport(year, month, gaushala_id, item_id);

  const getStock = await Report.aggregate([
    {
      $match: {
        date: {
          $regex: `^${year}-${month}-\\d{2}`, // Matches '2023-10-XX' format
        },
        gaushala_id: gaushala_id,
        item_id: item_id,
      },
    },
    {
      $project: {
        closing_qty_of_item: 1,
        // createdAt: 0,
        // updatedAt: 0,
        // isDeleted: 0,
        // date: 0,
        // isActive: 0,
        // __v: 0,
        _id: 0,
      },
    },
  ]);

  console.log("get stock data : ", getStock);
  if (getStock.length == 0) {
    return res.recordNotFound();
  }

  return res.success({ data: getStock[0] });

  // } catch (error) {
  //   return res.internalServerError({ message: error.message });
  // }
};

// gaushala detail report start from here
async function gaushal_details_master_report(year, month, gaushala_id) {
  try {
    const todayDate = getTodayDate();
    const dateParts = todayDate.split("-");
    const curMonth = dateParts[1];
    const curYear = dateParts[0];
    const curDate = dateParts[2];
    let getDataOfCurrentMonthStock = [];
    let currentMonthData = [];

    if (year > curYear || (year >= curYear && month > curMonth)) {
      return; // Stop the recursion when we reach the current month/year.
    }

    month = addZeroInMonth(month);

    let date = `${year}-${month}-01`;

    console.log(date);

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

    const getAllCalculation = await getAllCalculations({
      query: query,
      options: options,
      year: year,
      gaushala_id: gaushala_id,
    });

    const getDataOfCurrentMonth = getCurrentMonthData(
      getAllCalculation.foundSales_reports,
      getAllCalculation.getMonthlyExpence,
      year,
      month
    );

    const cows = await dbService.findAll(
      COW,
      { gaushala_id, type: { $nin: ["Donate", "Died"] } },
      {}
    );

    const cowsCount = cows.length;

    const expenseData = getDataOfCurrentMonth.expenseData;

    const totalUsedAmount = expenseData ? expenseData.total_in_stock_amount : 0;
    const per_cattle_expense =
      cowsCount !== 0 ? totalUsedAmount / cowsCount : 0;

    // Limiting to 3 digits after the decimal point
    // const totalUsedAmountFormatted = totalUsedAmount.toFixed(3);
    const totalUsedAmountFormatted = totalUsedAmount
      ? totalUsedAmount.toFixed(3)
      : 0;
    const total_in_stock_amounFormatted = per_cattle_expense
      ? per_cattle_expense.toFixed(3)
      : 0;

    const dataToCreate = {
      gaushala_id: gaushala_id,
      cattle_count: cowsCount,
      expense: totalUsedAmountFormatted,
      per_cattle_expense: total_in_stock_amounFormatted,
      production: getDataOfCurrentMonth.salesData.total_sales_amount,
      stock: getDataOfCurrentMonth.expenseData.closing_amount,
      date: date,
    };

    currentMonthData = await getGaushalaDetailsCurrentMonthData(
      year,
      month,
      gaushala_id
    );

    if (currentMonthData.length == 0) {
      await dbService.create(Gaushal_details_master, dataToCreate);
    } else {
      await dbService.updateOne(
        Gaushal_details_master,
        updateQuery,
        dataToCreate
      );
    }
    month++;

    if (month > 12) {
      month = 1;
      year++;
    }
    // await new Promise((resolve) => setTimeout(resolve, 10000)); // Simulate an async operation (waiting for 10 seconds).
    return gaushal_details_master_report(year, month, gaushala_id);
  } catch (error) {
    console.log("error in gaushala detail master : ", error.message);
    return res.internalServerError({ message: error.message });
  }
}

function getCurrentMonthData(salesReports, monthlyExpenses, year, month) {
  const currentMonthKey = `${year}-${month}`;

  // Find sales report for the current month
  const currentMonthSales = salesReports.find((report) =>
    report.date.startsWith(currentMonthKey)
  );

  // Find monthly expense for the current month
  const currentMonthExpense = monthlyExpenses.find(
    (expense) => expense._id === currentMonthKey
  );

  // Create an object combining sales and expense data for the current month
  const result = {
    currentMonth: currentMonthKey,
    salesData: currentMonthSales || { total_sales_amount: 0 },
    expenseData: currentMonthExpense || {
      total_used_amount: 0,
      opening_amount: 0,
      closing_amount: 0,
    },
  };

  return result;
}

function getGaushalaDetailsCurrentMonthData(
  currentYear,
  currentMonth,
  gaushala_id
) {
  currentMonth = addZeroInMonth(currentMonth);

  const matchStage = {
    date: {
      $regex: `^${currentYear}-${currentMonth}-\\d{2}`, // Matches '2023-10-XX' format
    },
    gaushala_id: gaushala_id,
  };
  console.log("match stage in gaushala detail master : ", matchStage);

  return Gaushal_details_master.aggregate([
    {
      $match: matchStage,
    },
  ]);
}

module.exports = {
  cattleReportMonthlyAddedCounts,
  salesReportAllDepartmentsMonthly,
  getAllCalculations,
  getItemStock,
  milkReport,
  cattleReport,
  findAllSales_report,
  findAllSales_report1,
  salesReport,
  salesReportMonthlyDepartment,
  salesReportMonthlyItems,
  createAllReport,
  addReport,
  bulkInsertReport,
  findAllStockReport,
};
