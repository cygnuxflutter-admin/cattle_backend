const Stock = require('../../../model/stock');
const stockSchemaKey = require('../../../utils/validation/stockValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/common');
const authConstant = require('../../../constants/authConstant');
const item_master = require('../../../model/item_master');
const report = require('../../../model/report');
const rfo_details = require('../../../model/rfo_details');
const cron = require('node-cron');
const stock = require('../../../model/stock');


const
  lastRFONo = async (req, res) => {

    // const last_RFO = await Item_master.findOne({}, {}, { sort: { ItemId: -1 } }).lean();

    try {

      const all_RFO = await Stock.find({ gaushala_id: req.user.gaushala_id, RFO_no: { $ne: "" } });
      const lastRFO = await rfo_details.findOne({ gaushala_id: req.user.gaushala_id }, {}, { sort: { RFO_no: -1 } });

      const last_RFO_index = all_RFO.length - 1;
      let last_RFO = lastRFO.RFO_no;
      if (req.user.gaushala_id !== '01') {
        last_RFO = all_RFO[last_RFO_index].RFO_no;
      }

      return res.success({ data: last_RFO });

    } catch (error) {
      return res.internalServerError({ message: error.message });
    }


  };

/**
 * @description : create document of Stock in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Stock. {status, message, data}
 */
// const addStock = async (req, res) => {
//   try {
//     let dataToCreate = { ...req.body || {} };
//     let dataToCreateRFO = { ...req.body || {} };
//     let validateRequest = validation.validateParamsWithJoi(
//       dataToCreate,
//       stockSchemaKey.schemaKeys);
//     if (!validateRequest.isValid) {
//       return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
//     }

//     const isRFOAlreadyExist = await isRFOExist(dataToCreate.RFO_no);

//     dataToCreate = new Stock(dataToCreate);

//     dataToCreate = {
//       RFO_no: dataToCreate.RFO_no,
//       gaushala_id: dataToCreate.gaushala_id,
//       vendor_id: dataToCreate.vendor_id,
//       bill_no: dataToCreate.bill_no,
//       item_id: dataToCreate.item_id,
//       expence_type: dataToCreate.expence_type,
//       qty: dataToCreate.qty,
//       kg_per_unit: dataToCreate.kg_per_unit,
//       rate_per_unit: dataToCreate.rate_per_unit,
//       totalWtOrQty: dataToCreate.totalWtOrQty,
//       total_amount: dataToCreate.total_amount,
//       entry_by: dataToCreate.entry_by,
//       remark: dataToCreate.remark,
//       isStock: dataToCreate.isStock,
//       date: dataToCreate.date,
//       bill_date: dataToCreate.bill_date
//     }


//     if (!isRFOAlreadyExist) {

//       dataToCreateRFO = {
//         RFO_no: dataToCreateRFO.RFO_no,
//         gaushala_id: dataToCreateRFO.gaushala_id,
//         rfo_type: dataToCreateRFO.rfo_type,
//         paymentType: dataToCreateRFO.paymentType,
//         vendor_id: dataToCreateRFO.vendor_id,
//         vendorName: dataToCreateRFO.vendorName,
//         date: dataToCreateRFO.date,
//         fromDate: dataToCreateRFO.fromDate,
//         toDate: dataToCreateRFO.toDate
//       }

//       await dbService.create(rfo_details, dataToCreateRFO);

//     }

//     let createdStock = await dbService.create(Stock, dataToCreate);
//     return res.success({ data: createdStock });
//   } catch (error) {
//     return res.internalServerError({ message: error.message });
//   }
// };

//--------------------------------------------------------------------------------------------

// const bulkInsertStock = async (req, res) => {
//   try {
//     if (!Array.isArray(req.body) || req.body.length < 1) {
//       return res.badRequest();
//     }

//     let dataToCreate = req.items;
//     let dataToStoreImages = req.images;

//     let newRFO_no = await autoGenerateRFO(req.user.gaushala_id); // Call the function to get the new RFO number

//     if (req.user.gaushala_id === '01') {
//       dataToCreate = dataToCreate.map(item => ({
//         ...item,
//         RFO_no: newRFO_no, // Set the auto-generated RFO number for each item
//       }));
//     }

//     let dataToCreateRFO = {
//       RFO_no: newRFO_no,
//       gaushala_id: dataToCreate[0].gaushala_id,
//       rfo_type: dataToCreate[0].rfo_type,
//       paymentType: dataToCreate[0].paymentType,
//       vendor_id: dataToCreate[0].vendor_id,
//       vendorName: dataToCreate[0].vendorName,
//       date: dataToCreate[0].date,
//       fromDate: dataToCreate[0].fromDate,
//       toDate: dataToCreate[0].toDate,
//     };

//     if (req.user.gaushala_id !== '01') {
//       dataToCreateRFO.RFO_no = dataToCreate[0].RFO_no;
//     }

//     const filePaths = utils.saveImagesLocally(dataToStoreImages);

//     await dbService.create(rfo_details, dataToCreateRFO);

//     let createdStocks = await dbService.create(Stock, dataToCreate);
//     createdStocks = { count: createdStocks ? createdStocks.length : 0 };
//     return res.success({ data: { count: createdStocks.count || 0 } });
//   } catch (error) {
//     return res.internalServerError({ message: error.message });
//   }
// };

const  bulkInsertStock = async (req, res) => {
  try {
    let dataToCreate = JSON.parse(req.body.items);
    const dataToStoreImages = req.files;

    if (!Array.isArray(dataToCreate) || dataToCreate.length < 1) {
      return res.badRequest();
    }

    const newRFO_no = await autoGenerateRFO(req.user.gaushala_id); // Call the function to get the new RFO number
    console.log(newRFO_no);

    if (req.user.gaushala_id === '01') {
      dataToCreate.forEach(item => {
        item.RFO_no = newRFO_no.toString(); // Set the auto-generated RFO number for each item
      });
    }

    let dataToCreateRFO = {
      RFO_no: newRFO_no,
      gaushala_id: dataToCreate[0].gaushala_id,
      rfo_type: dataToCreate[0].rfo_type,
      paymentType: dataToCreate[0].paymentType,
      cgst: dataToCreate[0].cgst,
      sgst: dataToCreate[0].sgst,
      vendor_id: dataToCreate[0].vendor_id,
      vendorName: dataToCreate[0].vendorName,
      date: dataToCreate[0].date,
      fromDate: dataToCreate[0].fromDate,
      toDate: dataToCreate[0].toDate,
    };

    if (req.user.gaushala_id !== '01') {
      dataToCreateRFO.RFO_no = dataToCreate[0].RFO_no;
    }

    const customFolderName = 'stock_bills';

    let filePaths = [];
    let url = [];
    if (dataToStoreImages.length > 0 || dataToStoreImages !== undefined || !dataToStoreImages) {
      filePaths = utils.saveImagesLocally(dataToStoreImages, customFolderName);
      url = await utils.uploadImagesToS3(filePaths, customFolderName);
      utils.deleteLocalImages(filePaths);
    }
    // Update items with image paths
    dataToCreate.forEach((item, index) => {
      item.bill_image = url;
    });

    await dbService.create(rfo_details, dataToCreateRFO);

    let createdStocks = await dbService.create(Stock, dataToCreate);
    createdStocks = { count: createdStocks ? createdStocks.length : 0 };
    //createdStocks = { count: dataToCreate ? dataToCreate : 0 };
    return res.success({ data: { count: createdStocks.count || 0 } });
    //return res.success({ data: createdStocks });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

// function to upload image manually

const uploadStockBill = async (req, res) => {
  try {
    const filePaths = utils.saveImagesLocally(req.files);
    const url = await utils.uploadImagesToS3(filePaths, 'stock_bills');
    utils.deleteLocalImages(filePaths);
    console.log(url);
    return res.success({ data: url });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

////////////////////////////////////

/**
 * @description : find all documents of Stock from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Stock(s). {status, message, data}
 */
const findAllStock = async (req, res) => {
  try {
    const reqBody = {
      "query": {},
      "options": {
        "select": [
          "RFO_no",
          "gaushala_id",
          "vendor_id",
          "bill_no",
          "item_id",
          "cgst",
          "sgst",
          "expence_type",
          "qty",
          "kg_per_unit",
          "rate_per_unit",
          "totalWtOrQty",
          "total_amount",
          "entry_by",
          "remark",
          "isStock",
          "date",
          "bill_date"
        ],
        "collation": "",
        "sort": "",
        "populate": "",
        "projection": "",
        "lean": false,
        "leanWithId": true,
        "offset": 0,
        "page": 1,
        "limit": 10,
        "pagination": false,
        "useEstimatedCount": false,
        "useCustomCountFn": false,
        "forceCountFn": false,
        "read": {},
        "options": {}
      },
      "isCountOnly": false
    }

    let options = reqBody.options;
    let query = reqBody.query;
    query.gaushala_id = req.user.gaushala_id;

    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    query.isDeleted = false;

    if (req.body.startDate && req.body.endDate) {
      // Add a date range condition to the query
      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // Check if the user has provided an expence_type filter as an array
    if (Array.isArray(req.body.expence_type) && req.body.expence_type.length > 0) {
      // Add an expence_type condition using $in to match any of the specified values
      query.expence_type = {
        $in: req.body.expence_type,
      };
    }

    if (Array.isArray(req.body.item_id) && req.body.item_id.length > 0) {
      // Add an item_id condition using $in to match any of the specified values
      query.item_id = {
        $in: req.body.item_id,
      };
    }

    let validateRequest = validation.validateFilterWithJoi(
      reqBody,
      stockSchemaKey.findFilterKeys,
      Stock.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
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
          as: "item_mastersData",
        },
      },
      {
        $unwind: "$item_mastersData",
      },
      {
        $match: {
          "item_mastersData.gaushala_id": query.gaushala_id,
        },
      },
      {
        $lookup: {
          from: "vendors",
          localField: "vendor_id",
          foreignField: "Code",
          as: "vendorsData",
        },
      },
      {
        $unwind: {
          path: "$vendorsData",
          preserveNullAndEmptyArrays: true, // Preserve documents where there is no matching vendor
        },
      },
      {
        $match: {
          $or: [
            { "vendorsData.gaushala_id": query.gaushala_id },
            { "vendorsData": { $exists: false } }, // Include documents with no matching vendor
          ],
        },
      },
      {
        $project: {
          RFO_no: 1,
          gaushala_id: 1,
          vendor_id: 1,
          bill_no: 1,
          item_id: 1,
          cgst: 1,
          sgst: 1,
          expence_type: 1,
          qty: 1,
          kg_per_unit: 1,
          rate_per_unit: 1,
          totalWtOrQty: 1,
          total_amount: 1,
          entry_by: 1,
          remark: 1,
          isStock: 1,
          date: 1,
          isDeleted: 1,
          //ItemName: "$item_mastersData.ItemName",
          ItemName: {
            $cond: {
              if: { $eq: ["$item_mastersData.ItemName", "OTHER"] },
              then: { $concat: ["$item_mastersData.ItemName", " ", "$remark"] },
              else: "$item_mastersData.ItemName",
            },
          },
          vendor_name: {
            $cond: {
              if: { $eq: ["$vendor_id", "$gaushala_id"] },
              then: "Out entry from gaushala",
              else: "$vendorsData.Name",
            },
          },
        },
      },
    ];


    let stockWithItemNames = await Stock.aggregate(pipeline);

    // console.log("stockWithItemNames : ", stockWithItemNames)

    let query2 = {};
    query2.date = getMonthYear(startDate, endDate);


    const pipelineForReport = [
      {
        $match: query2
      }
    ]

    const reportsData = await report.aggregate(pipelineForReport);

    // Iterate through stocks array
    stockWithItemNames.forEach(stock => {
      // Find the corresponding report in reports array based on item_id and matching month and year
      const matchingReport = reportsData.find(report =>
        report.item_id === stock.item_id &&
        new Date(report.date).getMonth() === new Date(stock.date).getMonth() &&
        new Date(report.date).getFullYear() === new Date(stock.date).getFullYear()
      );

      stock.average_price_of_item = 0;
      // If a matching report is found, update average_price_of_item in the stock object
      if (matchingReport) {
        stock.average_price_of_item = matchingReport.average_price_of_item;
      }
    });


    if (!stockWithItemNames || stockWithItemNames.length === 0 || !reportsData || reportsData.length === 0) {
      return res.recordNotFound();
    }

    return res.success({ data: stockWithItemNames });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const getMonthlyStockSummary = async (req, res) => {
  try {
    const { year } = req.body;
    console.log("Year received:", year);
    if (!year) {
      return res.validationError({ message: "Year is required" });
    }

    const startDate = `${year}-04-01`;
    const endDate = `${parseInt(year) + 1}-03-31`;

    const monthlySummary = await stock.aggregate([
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
          totalAmount: { $sum: "$total_amount" }
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
        _id: key,
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



function getMonthYear(startDate, endDate) {
  const startParts = startDate.split('-');
  const startMonth = startParts[1];
  const startYear = startParts[0];

  const endParts = endDate.split('-');
  const endMonth = endParts[1];
  const endYear = endParts[0];

  // const startYearMonth = {
  //   $regex: `^${startYear}-${startMonth}-\\d{2}`, // Matches '2023-10-XX' format
  // };

  // const endYearMonth = {
  //   $regex: `^${endYear}-${endMonth}-\\d{2}`, // Matches '2023-10-XX' format
  // };

  const date = {
    $gte: `${utils.getFirstAndLastDateOfMonth(startYear, startMonth).startDate}`,
    $lte: `${utils.getFirstAndLastDateOfMonth(endYear, endMonth).endDate}`
  };

  return date;
}

/**
 * @description : find document of Stock from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Stock. {status, message, data}
 */
const getStock = async (req, res) => {
  try {
    let query = {};
    query.gaushala_id = req.user.gaushala_id;
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message: 'invalid objectId.' });
    }
    query._id = req.params.id;
    let options = {};
    let foundStock = await dbService.findOne(Stock, query, options);
    if (!foundStock) {
      return res.recordNotFound();
    }
    return res.success({ data: foundStock });
  }
  catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : returns total number of documents of Stock.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getStockCount = async (req, res) => {
  try {
    let where = {};
    where.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      stockSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedStock = await dbService.count(Stock, where);
    return res.success({ data: { count: countedStock } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update document of Stock with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Stock.
 * @return {Object} : updated Stock. {status, message, data}
 */
const updateStock = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };

    const userType = req.user.userType

    if (userType === authConstant.USER_TYPES.User || userType === authConstant.USER_TYPES.guruji || userType === authConstant.USER_TYPES.medical || userType === authConstant.USER_TYPES.dairy || userType === authConstant.USER_TYPES.ground) {
      return res.unAuthorized({ message: 'You are not authorized to access this functionality.' })
    }

    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      stockSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedStock = await dbService.updateOne(Stock, query, dataToUpdate);
    if (!updatedStock) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedStock });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : partially update document of Stock with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated Stock.
 * @return {obj} : updated Stock. {status, message, data}
 */
const partialUpdateStock = async (req, res) => {
  try {
    if (!req.params.id) {
      res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      stockSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedStock = await dbService.updateOne(Stock, query, dataToUpdate);
    if (!updatedStock) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedStock });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const deleteRecordAsRFO = async (req, res) => {
  try {
    if (!req.body.RFO_no) {
      return res.badRequest({ message: 'Insufficient request parameters! RFO no is required.' });
    }
    const query = { RFO_no: req.body.RFO_no, gaushala_id: req.user.gaushala_id };

    const deletedRFO = await dbService.deleteMany(Stock, query);

    if (deletedRFO.deletedCount === 0) {
      return res.recordNotFound();
    }

    return res.success({ data: { deletedRFO } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

//update stock as per RFO 
const updateStockAsPerRFO = async (req, res) => {
  try {

    const stockList = req.body.stockList;
    const errorRFO = [];
    const updatedRFOs = [];
    for (var stock of stockList) {

      const RFO_no = stock.RFO_no.toString();
      const findStock = await dbService.findAll(Stock, { RFO_no, total_amount: stock.total_amount });

      if (!findStock || findStock.length != 0) {

        let date = '';
        if (stock.rfo_date != undefined) {
          date = stock.rfo_date;
        } else {
          date = findStock[0].date
        }

        await dbService.updateOne(Stock, { RFO_no: findStock[0].RFO_no, total_amount: findStock[0].total_amount }, { date: date });

        updatedRFOs.push({
          RFO_no: stock.RFO_no,
          billDate: stock.date,
          rfo_date: stock.rfo_date,
          dbDate: findStock[0].date,
          dbTotalAmnt: findStock[0].total_amount
        })

      } else {
        errorRFO.push({
          RFO_no: stock.RFO_no,
          billDate: stock.date,
          rfo_date: stock.rfo_date
        })

      }

    }
    return res.success({ data: { errorRFO, updatedRFOs } });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }

};


// manual stock entry
const manual_stock_entry = async (req, res) => {
  try {

    const stockData = req.body;
    const successArray = [];
    const errorArray = [];

    for (var data of stockData) {

      if (data.item_id != undefined) {

        if (data.item_id != 3) {

          const item_id = data.item_id.toString();

          const findItem = await dbService.findOne(item_master, { ItemId: item_id });

          let remark = '';
          if (data.remark != undefined) {
            remark = data.remark
          }

          if (findItem) {
            const qty = data.qty.toString()
            let stock = {
              "RFO_no": data.rfo_no,
              "gaushala_id": "01",
              "vendor_id": data.vendor_id,
              "bill_no": data.bill_no,
              "item_id": item_id,
              "expence_type": findItem.expence_type,
              "qty": qty,
              "kg_per_unit": data.kg_per_unit,
              "rate_per_unit": data.rate_per_unit,
              "totalWtOrQty": data.totalWtOrQty,
              "total_amount": data.total_amount,
              "entry_by": "Manual Entry From Backend",
              "remark": remark,
              "isStock": findItem.isStock,
              "date": data.RFO_date,
            }

            stock = new Stock(stock);

            await dbService.create(Stock, stock);

            successArray.push(stock);
          } else {
            errorArray.push(data);
          }
        } else {
          errorArray.push(data);
        }
      } else {
        errorArray.push(data);
      }


    }
    return res.success({ data: { successArray, errorArray } });

  } catch (error) {
    return res.internalServerError({ message: error.message });

  }
};

// manual stock entry old data
const manual_stock_entry_old = async (req, res) => {
  try {

    const stockData = req.body.data;
    let rfo = [];

    for (var data of stockData) {

      let v_id = 'V0'
      v_id = data.vendor_id

      const qty = data.qty.toString()
      const remark = `vendor_id = ${v_id} supplier_name = ${data.supplier_name} item_name = ${data.item_name} `
      let stock = {
        "RFO_no": data.rfo_no,
        "gaushala_id": "01",
        "vendor_id": v_id,
        "bill_no": data.bill_no,
        "item_id": "370",///
        "expence_type": data.expence_type,
        "qty": qty,
        "kg_per_unit": 0, //
        "rate_per_unit": data.rate_per_unit,
        "totalWtOrQty": 0, //
        "total_amount": data.total_amount,
        "entry_by": "Manual Entry From Backend OLD data",
        "bill_date": data.bill_date,
        "remark": remark,
        "isStock": false,
        "date": data.date,
      }

      // RFO Details
      // let dataToCreateRFO = {
      //   RFO_no: newRFO_no,
      //   gaushala_id: data.gaushala_id,
      //   rfo_type: 1,
      //   paymentType: data.paymentType,
      //   vendor_id: data.vendor_id == undefined ? 'V0' : data.vendor_id,
      //   vendorName: data.vendorName,
      //   date: data.date,
      //   fromDate: data.date,
      //   toDate: data.date,
      // };
      //await dbService.create(rfo_details, dataToCreateRFO);

      console.log(stock.RFO_no);
      rfo.push(stock.RFO_no)


      stock = new Stock(stock);

      await dbService.create(Stock, stock);
    }

    return res.success({ data: rfo })

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const getUniqueRFO = async (req, res) => {
  try {

    // const pipeline = [
    //   {
    //     $group: {
    //       _id: '$RFO_no',
    //       total_amount: { $sum: '$total_amount' },
    //       date: { $first: "$date" },
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       RFO_no: '$_id',
    //       total_amount: 1,
    //       date: 1
    //     }
    //   }
    // ];

    // const result = await Stock.aggregate(pipeline);


    const items = await item_master.find();
    const data = [];

    // console.log(items)

    for (var item of items) {

      const expenceType = item.ExpenceType;
      const item_id = item.ItemId

      const update = await Stock.updateMany(
        { item_id: item_id, entry_by: "Manual Entry From Backend" },
        { $set: { expence_type: expenceType } }
      );

      // console.log(update);
      if (update.matchedCount >= 1) {
        data.push({ item_id, expenceType })
        console.log("expenceType : ", expenceType, item_id)
      }


    }

    return res.success({ data: data });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
}


const getData = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$RFO_no',
          total_amount: { $sum: '$total_amount' },
          date: { $first: "$date" },
        },
      },
      {
        $project: {
          _id: 0,
          RFO_no: '$_id',
          total_amount: 1,
          date: 1
        }
      }
    ];

    const result = await Stock.aggregate(pipeline);

    return res.success({ data: result });


  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
}

const autoGenerateStock = async (req, res) => {
  try {

    // const gaushala_list = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
    const gaushala_list = ["01"];

    for (let i = 0; i < gaushala_list.length; i++) {
      let gaushala_id = gaushala_list[i];

      const autoGenerateItems = await dbService.findAll(item_master, { 'autoInfo.isAutoGenerate': true, gaushala_id: gaushala_id });

      if (autoGenerateItems.length == 0) {
        return 'No Item Found';
      }

      for (var item of autoGenerateItems) {


        let findStock = await Stock.findOne({ item_id: item.ItemId, date: utils.getTodayDate() });

        if (findStock) {
          continue;
        }

        let dataToCreate = {};
        dataToCreate = {
          "RFO_no": "",
          "gaushala_id": gaushala_id,
          "vendor_id": gaushala_id,
          "bill_no": "",
          "item_id": item.ItemId,
          "expence_type": item.ExpenceType,
          "qty": "1",
          "kg_per_unit": 0,
          "rate_per_unit": 0,
          "totalWtOrQty": item.autoInfo.totalWtOrQty,
          "total_amount": 0,
          "entry_by": "Auto generated stock",
          "remark": "",
          "isStock": item.isStock,
          "date": utils.getTodayDate()
        }
        dataToCreate = new Stock(dataToCreate)

        await dbService.create(Stock, dataToCreate);
      }
    }

  } catch (error) {
    return `Something went wrong ${error.message}`;
  }
}

async function isRFOExist(RFO_no) {
  try {

    const data = await rfo_details.findOne({ RFO_no });
    if (data) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
}

const validateRFO = async (req, res) => {
  try {
    const RFO_no = req.body.RFO_no;
    const result = await isRFOExist(RFO_no);
    let data = {};

    if (result) {

      data = await rfo_details.findOne({ RFO_no, gaushala_id: req.user.gaushala_id });
      data = { ...data.toObject(), isRFOExist: result };
      return res.success({ data: data });
    }
    data = {
      "_id": "",
      "RFO_no": "",
      "gaushala_id": "",
      "rfo_type": 0,
      "paymentType": 0,
      "vendor_id": "",
      "vendorName": "",
      "date": "",
      "fromDate": "",
      "toDate": "",
      "createdAt": "",
      "updatedAt": "",
      "isDeleted": true,
      "__v": 0,
      "isRFOExist": result
    };
    return res.success({ data: data });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
}

const getRFODetails = async (req, res) => {
  try {
    const RFO_no = req.body.RFO_no;
    const data = await rfo_details.findOne({ RFO_no, gaushala_id: req.user.gaushala_id });
    if (!data) {
      return res.recordNotFound();
    }

    const pipeline = [
      {
        $match: {
          RFO_no: RFO_no
        }
      },
      {
        $lookup: {
          from: "stocks",
          localField: "RFO_no",
          foreignField: "RFO_no",
          as: "items"
        }
      },
      {
        $project: {
          _id: 1,
          RFO_no: 1,
          gaushala_id: 1,
          cgst: 1,
          sgst: 1,
          rfo_type: 1,
          paymentType: 1,
          vendor_id: 1,
          vendorName: 1,
          date: 1,
          fromDate: 1,
          toDate: 1,
          items: 1 // Included "items" field in projection
        }
      }
    ];

    const result = await rfo_details.aggregate(pipeline);

    if (!result || result.length === 0) {
      return res.recordNotFound();
    }

    // const BASE_URL = process.env.NODE_ENV === 'test' ? process.env.BASE_URL_TEST : process.env.BASE_URL;
    // test url
    // // Add full URL to bill_image paths
    // result.forEach(detail => {
    //   if (detail.items) {
    //     detail.items.forEach(item => {
    //       if (item.bill_image && item.bill_image.length > 0) {
    //         item.bill_image = item.bill_image.map(imagePath => `${BASE_URL}/${imagePath.replace(/\\/g, '/')}`);
    //       }
    //     });
    //   }
    // });

    return res.success({ data: result });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const autoGenerateRFO = async (gaushala_id) => {
  try {
    const lastRFO = await rfo_details.findOne({ gaushala_id: gaushala_id }, {}, { sort: { RFO_no: -1 } });

    let newRFO_no;
    if (!lastRFO) {
      newRFO_no = 'G-40001'; // If no RFO exists, start from G-40001
    } else {
      const lastRFO_no = lastRFO.RFO_no;
      const lastRFO_no_parts = lastRFO_no.split('-');
      const lastRFO_number = parseInt(lastRFO_no_parts[1]);
      newRFO_no = `G-${lastRFO_number + 1}`;
    }
    return newRFO_no;
  } catch (error) {
    throw new Error(`Error generating RFO number: ${error.message}`);
  }
};

const addStock = async (req, res) => {
  try {
    // let dataToCreateArray = { ...req.body || [] };
    // let dataToCreateRFO = { ...req.body || {} };
    // let dataToCreate = {};
    // dataToCreate.bill_date = '1001-01-01';
    // let validateRequest = validation.validateParamsWithJoi(
    //   dataToCreate,
    //   stockSchemaKey.schemaKeys
    // );
    // if (!validateRequest.isValid) {
    //   return res.validationError({
    //     message: `Invalid values in parameters, ${validateRequest.message}`,
    //   });
    // }

    // const newRFO_no = await autoGenerateRFO(req.user.gaushala_id); // Call the function to get the new RFO number
    // dataToCreate.RFO_no = newRFO_no; // Set the auto-generated RFO number

    // const isRFOAlreadyExist = await isRFOExist(dataToCreate.RFO_no);

    let dataToCreateArray = req.body || []; // Expecting an array of stock entries from the request body
    if (!Array.isArray(dataToCreateArray) || dataToCreateArray.length === 0) {
      return res.validationError({
        message: 'Request body should contain an array of stock data.'
      });
    }

    // for (let data of dataToCreateArray) {
    //   data.bill_date = '1001-01-01';

    //   dataToCreate = {
    //     RFO_no: '',
    //     gaushala_id: dataToCreate.gaushala_id,
    //     vendor_id: dataToCreate.vendor_id,
    //     bill_no: dataToCreate.bill_no,
    //     item_id: dataToCreate.item_id,
    //     expence_type: dataToCreate.expence_type,
    //     qty: dataToCreate.qty,
    //     kg_per_unit: dataToCreate.kg_per_unit,
    //     rate_per_unit: dataToCreate.rate_per_unit,
    //     totalWtOrQty: dataToCreate.totalWtOrQty,
    //     total_amount: dataToCreate.total_amount,
    //     entry_by: dataToCreate.entry_by,
    //     remark: dataToCreate.remark,
    //     isStock: dataToCreate.isStock,
    //     date: dataToCreate.date,
    //     bill_date: dataToCreate.bill_date,
    //     bill_image: []
    //   };

    // }

    // if (!isRFOAlreadyExist) {
    //   dataToCreateRFO = {
    //     RFO_no: newRFO_no,
    //     gaushala_id: dataToCreateRFO.gaushala_id,
    //     rfo_type: dataToCreateRFO.rfo_type,
    //     paymentType: dataToCreateRFO.paymentType,
    //     vendor_id: dataToCreateRFO.vendor_id,
    //     vendorName: dataToCreateRFO.vendorName,
    //     date: dataToCreateRFO.date,
    //     fromDate: dataToCreateRFO.fromDate,
    //     toDate: dataToCreateRFO.toDate,
    //   };

    // await dbService.create(rfo_details, dataToCreateRFO);
    // }

    const gaushala_id = req.user.gaushala_id;

    let stocksToInsert = dataToCreateArray.map(data => ({
      RFO_no: '', // Assign RFO_no if needed
      gaushala_id: gaushala_id,
      vendor_id: gaushala_id,
      bill_no: '',
      item_id: data.item_id,
      expence_type: data.expence_type,
      qty: '1',
      kg_per_unit: 0,
      rate_per_unit: 0.0,
      totalWtOrQty: data.totalWtOrQty,
      total_amount: 0,
      entry_by: data.entry_by,
      remark: data.remark,
      isStock: data.isStock,
      date: data.date,
      bill_date: '1001-01-01', // Hardcoded bill_date
      bill_image: []
    }));


    // Bulk insert into the database
    let createdStocks = await dbService.create(Stock, stocksToInsert);

    return res.success({ data: createdStocks });
    //return res.success({ data: createdStock });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};



module.exports = {
  manual_stock_entry_old,
  autoGenerateStock,
  getData,
  getUniqueRFO,
  manual_stock_entry,
  bulkInsertStock,
  updateStockAsPerRFO,
  deleteRecordAsRFO,
  lastRFONo,
  addStock,
  findAllStock,
  getMonthlyStockSummary,
  getStock,
  getStockCount,
  updateStock,
  partialUpdateStock,
  validateRFO,
  getRFODetails,
  uploadStockBill
};