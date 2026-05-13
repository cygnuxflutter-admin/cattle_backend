const CMS_bill = require('../../../model/CMS_bill');
const CMS_billSchemaKey = require('../../../utils/validation/CMS_billValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/common');
const stock = require('../../../model/stock');

/**
 * @description : create document of CMS_bill in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created CMS_bill. {status, message, data}
 */
const addCMS_bill = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      CMS_billSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    dataToCreate.gaushala_id = req.user.gaushala_id

    dataToCreate = new CMS_bill(dataToCreate);
    let createdCMS_bill = await dbService.create(CMS_bill, dataToCreate);
    return res.success({ data: createdCMS_bill });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : create multiple documents of CMS_bill in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created CMS_bills. {status, message, data}
 */
const bulkInsertCMS_bill = async (req, res) => {
  try {
    if (req.body && (!Array.isArray(req.body.data) || req.body.data.length < 1)) {
      return res.badRequest();
    }
    let dataToCreate = [...req.body.data];
    for (let i = 0; i < dataToCreate.length; i++) {
      dataToCreate[i].gaushala_id = req.user.gaushala_id
    }
    let createdCMS_bills = await dbService.create(CMS_bill, dataToCreate);
    createdCMS_bills = { count: createdCMS_bills ? createdCMS_bills.length : 0 };
    return res.success({ data: { count: createdCMS_bills.count || 0 } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find all documents of CMS_bill from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found CMS_bill(s). {status, message, data}
 */
const findAllCMS_bill = async (req, res) => {
  try {

    let reqBody = {
      "query": {},
      "options": {
        "select": [
          "CMS_no",
          "RFO_no",
          "date",
          "addedBy"
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
        "pagination": true,
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
    let validateRequest = validation.validateFilterWithJoi(
      reqBody,
      CMS_billSchemaKey.findFilterKeys,
      CMS_bill.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof query === 'object' && query !== null) {
      query = { ...query };
    }
    if (reqBody.isCountOnly) {
      let totalRecords = await dbService.count(CMS_bill, query);
      return res.success({ data: { totalRecords } });
    }
    if (reqBody && typeof options === 'object' && options !== null) {
      options = { ...options };
    }
    let foundCMS_bills = await dbService.paginate(CMS_bill, query, options);
    if (!foundCMS_bills || !foundCMS_bills.data || !foundCMS_bills.data.length) {
      return res.recordNotFound();
    }
    return res.success({ data: foundCMS_bills });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find document of CMS_bill from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found CMS_bill. {status, message, data}
 */
const getCMS_bill = async (req, res) => {
  try {
    let query = {};
    query.gaushala_id = req.user.gaushala_id;
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message: 'invalid objectId.' });
    }
    query._id = req.params.id;
    let options = {};
    let foundCMS_bill = await dbService.findOne(CMS_bill, query, options);
    if (!foundCMS_bill) {
      return res.recordNotFound();
    }
    return res.success({ data: foundCMS_bill });
  }
  catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : returns total number of documents of CMS_bill.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getCMS_billCount = async (req, res) => {
  try {
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      CMS_billSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedCMS_bill = await dbService.count(CMS_bill, where);
    return res.success({ data: { count: countedCMS_bill } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update document of CMS_bill with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated CMS_bill.
 * @return {Object} : updated CMS_bill. {status, message, data}
 */
const updateCMS_bill = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      CMS_billSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedCMS_bill = await dbService.updateOne(CMS_bill, query, dataToUpdate);
    if (!updatedCMS_bill) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedCMS_bill });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update multiple records of CMS_bill with data by filter.
 * @param {Object} req : request including filter and data in request body.
 * @param {Object} res : response of updated CMS_bills.
 * @return {Object} : updated CMS_bills. {status, message, data}
 */
const bulkUpdateCMS_bill = async (req, res) => {
  try {
    let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
    let dataToUpdate = {};
    if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
      dataToUpdate = { ...req.body.data, };
    }
    let updatedCMS_bill = await dbService.updateMany(CMS_bill, filter, dataToUpdate);
    if (!updatedCMS_bill) {
      return res.recordNotFound();
    }
    return res.success({ data: { count: updatedCMS_bill } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : partially update document of CMS_bill with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated CMS_bill.
 * @return {obj} : updated CMS_bill. {status, message, data}
 */
const partialUpdateCMS_bill = async (req, res) => {
  try {
    if (!req.params.id) {
      res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      CMS_billSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    const query = { _id: req.params.id };
    let updatedCMS_bill = await dbService.updateOne(CMS_bill, query, dataToUpdate);
    if (!updatedCMS_bill) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedCMS_bill });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const getPendingRFOs = async (req, res) => {

  try {

    const gaushala_id = req.user.gaushala_id

    const result = await stock.aggregate([
      {
        $lookup: {
          from: 'cms_bills',
          localField: 'RFO_no',
          foreignField: 'RFO_no',
          as: 'cms_bills'
        }
      },
      {
        $match: {
          'cms_bills': { $size: 0 }, // Filter records where the 'cms_bills' array is empty (no match in cms_bill)
          'RFO_no': { $ne: '' }, // Exclude records where RFO_no is an empty string
          'gaushala_id': gaushala_id,
          // "cms_bills.gaushala_id": gaushala_id
        }
      },
      {
        $group: {
          _id: '$RFO_no', // Group by RFO_no
          date: { $first: { $ifNull: ['$date', 'N/A'] } } // Use $ifNull to handle missing date field
        }
      },
      {
        $project: {
          _id: 1, // Include the _id field in the result
          date: 1 // Include the 'date' field in the result
        }
      },
      {
        $sort: {
          date: 1
        }
      }
    ]);


    if (result.length > 0) {
      const uniqueRFOs = result.map(entry => ({ RFO_no: entry._id, date: entry.date }));
      return res.success({ data: uniqueRFOs });
    } else {
      return res.status(200).json({
        message: "Record(s) not found with specified criteria.",
        status: "SUCCESS",
        data: []
      });
    }
  } catch (err) {
    return res.internalServerError({ message: err.message });
  }

};

const getAddedRFOs = async (req, res) => {

  try {
    const gaushala_id = req.user.gaushala_id

    const result = await stock.aggregate([
      {
        $lookup: {
          from: 'cms_bills',
          localField: 'RFO_no',
          foreignField: 'RFO_no',
          as: 'cms_bills'
        }
      },
      {
        $match: {
          'cms_bills': { $not: { $size: 0 } }, // Filter records where the 'cms_bills' array is not empty (has a match in cms_bill)
          'RFO_no': { $ne: '' }, // Exclude records where RFO_no is an empty string
          'gaushala_id': gaushala_id
        }
      },
      {
        $unwind: '$cms_bills'
      },
      {
        $group: {
          _id: '$RFO_no', // Group by RFO_no
          CMS_no: { $first: '$cms_bills.CMS_no' },
          date: { $first: { $ifNull: ['$date', 'N/A'] } } // Use $ifNull to handle missing date field
        }
      },
      {
        $project: {
          _id: 1, // Include the _id field in the result
          CMS_no: 1,
          date: 1, // Include the 'date' field in the result
        }
      },
      {
        $sort: {
          date: 1
        }
      }
    ]);

    if (result.length > 0) {
      const uniqueRFOs = result.map(entry => ({ RFO_no: entry._id, date: entry.date, CMS_no: entry.CMS_no }));
      return res.success({ data: uniqueRFOs ?? [] });
    } else {
      return res.status(200).json({
        message: "Record(s) not found with specified criteria.",
        status: "SUCCESS",
        data: []
      });
    }
  } catch (err) {
    return res.internalServerError({ message: err.message });
  }
};

const getRFOSummery = async (req, res) => {
  try {
    const year = req.body.year;
    const gaushala_id = req.user.gaushala_id;

    const startDate = `${year}-04-01`;
    const endDate = `${year + 1}-03-31`;

    const pending = await stock.aggregate([
      {
        $lookup: {
          from: 'cms_bills',
          localField: 'RFO_no',
          foreignField: 'RFO_no',
          as: 'cms_bills'
        }
      },
      {
        $match: {
          'date': {
            $gte: startDate,
            $lte: endDate,
          },
          'cms_bills': { $size: 0 },
          'RFO_no': { $ne: '' },
          'gaushala_id': gaushala_id
        }
      },
      {
        $group: {
          _id: {
            RFO_no: '$RFO_no',
            month: {
              $dateToString: {
                format: '%Y-%m',
                date: {
                  $cond: [{ $ifNull: ['$date', false] }, { $toDate: '$date' }, '$date']
                }
              }
            }
          },
          unique_count: { $addToSet: '$RFO_no' }
        }
      },
      {
        $group: {
          _id: '$_id.month',
          total_count: { $sum: { $size: '$unique_count' } }
        }
      },
      {
        $project: {
          _id: 0,
          month: '$_id',
          count: '$total_count'
        }
      }
    ]);

    const addedData = await stock.aggregate([
      {
        $lookup: {
          from: 'cms_bills',
          localField: 'RFO_no',
          foreignField: 'RFO_no',
          as: 'cms_bills'
        }
      },
      {
        $match: {
          'date': {
            $gte: startDate,
            $lte: endDate,
          },
          'cms_bills': { $not: { $size: 0 } },
          'RFO_no': { $ne: '' },
          'gaushala_id': gaushala_id
        }
      },
      {
        $group: {
          _id: {
            RFO_no: '$RFO_no',
            month: {
              $dateToString: {
                format: '%Y-%m',
                date: {
                  $cond: [{ $ifNull: ['$date', false] }, { $toDate: '$date' }, '$date']
                }
              }
            }
          },
          unique_count: { $addToSet: '$RFO_no' }
        }
      },
      {
        $group: {
          _id: '$_id.month',
          total_count: { $sum: { $size: '$unique_count' } }
        }
      },
      {
        $project: {
          _id: 0,
          month: '$_id',
          count: '$total_count'
        }
      }
    ]);

    const monthCounts = [];
    // Iterate over the months of the specified financial year
    for (let month = 4; month <= 12; month++) { // April (4) to December (12)
      const formattedMonth = `${year}-${month.toString().padStart(2, '0')}`;
      const pendingEntry = pending.find(entry => entry.month === formattedMonth);
      const pendingCount = pendingEntry ? pendingEntry.count : 0;

      const addedEntry = addedData.find(entry => entry.month === formattedMonth);
      const addedCount = addedEntry ? addedEntry.count : 0;

      monthCounts.push({
        "date": formattedMonth,
        "pending": pendingCount,
        "added": addedCount
      });
    }

    // Special case for January (1) to March (3) of the next year
    for (let month = 1; month <= 3; month++) {
      const formattedMonth = `${year + 1}-${month.toString().padStart(2, '0')}`;
      const pendingEntry = pending.find(entry => entry.month === formattedMonth);
      const pendingCount = pendingEntry ? pendingEntry.count : 0;

      const addedEntry = addedData.find(entry => entry.month === formattedMonth);
      const addedCount = addedEntry ? addedEntry.count : 0;

      monthCounts.push({
        "date": formattedMonth,
        "pending": pendingCount,
        "added": addedCount
      });
    }

    if (monthCounts.length === 0) {
      return res.status(200).json({
        message: "Record(s) not found with specified criteria.",
        status: "SUCCESS",
        data: []
      });
    }

    return res.success({ data: monthCounts });

  } catch (err) {
    return res.internalServerError({ message: err.message });
  }
};

const getReminderRFOs = async (req, res) => {
  try {
    const gaushala_id = req.user.gaushala_id

    const result = await stock.aggregate([
      {
        $lookup: {
          from: 'cms_bills',
          localField: 'RFO_no',
          foreignField: 'RFO_no',
          as: 'cms_bills'
        }
      },
      {
        $match: {
          'cms_bills': { $size: 0 }, // Filter records where the 'cms_bills' array is empty (no match in cms_bill)
          'RFO_no': { $ne: '' }, // Exclude records where RFO_no is an empty string
          'gaushala_id': gaushala_id,
          // "cms_bills.gaushala_id": gaushala_id
        }
      },
      {
        $group: {
          _id: '$RFO_no', // Group by RFO_no
          date: { $first: { $ifNull: ['$date', 'N/A'] } } // Use $ifNull to handle missing date field
        }
      },
      {
        $project: {
          _id: 1, // Include the _id field in the result
          date: 1 // Include the 'date' field in the result
        }
      },
      {
        $sort: {
          date: 1
        }
      }
    ]);

    if (result.length > 0) {
      const uniqueRFOs = result.map(entry => ({ RFO_no: entry._id, date: entry.date }));
      const reminderRFOs = filterArrayForReminder(uniqueRFOs);

      if (reminderRFOs.length > 0) {
        return res.success({ data: reminderRFOs });
      } else {
        return res.status(200).json({
          message: "Record(s) not found with specified criteria.",
          status: "SUCCESS",
          data: []
        });
      }

    } else {
      return res.status(200).json({
        message: "Record(s) not found with specified criteria.",
        status: "SUCCESS",
        data: []
      });
    }
  } catch (err) {
    return res.internalServerError({ message: err.message });
  }
};

function filterArrayForReminder(array) {
  // Check if the array is null or undefined
  if (!array || array.length === 0) {
    console.log("Input array is null or empty.");
    return [];
  }

  const today = new Date();
  today.setDate(today.getDate() - 15);

  return array.filter(item => {
    // Check if the 'date' property exists and is a valid date string
    if (item.date) {
      const itemDate = new Date(item.date);
      return itemDate <= today;
    } else {
      console.log("Invalid date format for an array item.");
      return false;
    }
  });
}

module.exports = {
  getReminderRFOs,
  getAddedRFOs,
  getRFOSummery,
  getPendingRFOs,
  addCMS_bill,
  bulkInsertCMS_bill,
  findAllCMS_bill,
  getCMS_bill,
  getCMS_billCount,
  updateCMS_bill,
  bulkUpdateCMS_bill,
  partialUpdateCMS_bill
};