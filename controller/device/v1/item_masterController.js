const Item_master = require('../../../model/item_master');
const item_masterSchemaKey = require('../../../utils/validation/item_masterValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/common');
const item_master = require('../../../model/item_master');
const COW = require('../../../model/COW');
const report = require('../../../model/report');


/**
 * @description : create document of Item_master in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Item_master. {status, message, data}
 */
const addItem_master = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      item_masterSchemaKey.schemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({
        message: `Invalid values in parameters, ${validateRequest.message}`,
      });
    }

    // const maxItemIdDoc = await Item_master.findOne({}, {}, { sort: { ItemId: -1 } }).lean();
    const allItems = await Item_master.find();
    const maxItemIdDoc = allItems[allItems.length - 1];

    let nextItemId = "1"; // Default if no records exist yet

    if (maxItemIdDoc && maxItemIdDoc.ItemId) {

      const maxItemIdInt = parseInt(maxItemIdDoc.ItemId);

      nextItemId = (maxItemIdInt + 1).toString();
    }


    dataToCreate.ItemId = nextItemId;

    const checkItemId = await Item_master.findOne({ ItemId: nextItemId, gaushala_id: req.user.gaushala_id }).lean();

    if (checkItemId !== null) {
      return res.internalServerError({ message: `Item id already exists` });
    }
    dataToCreate.gaushala_id = req.user.gaushala_id

    const createdItem = new Item_master(dataToCreate);
    let createdItem_master = await dbService.create(Item_master, createdItem);

    return res.success({ data: createdItem_master });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : create multiple documents of Item_master in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created Item_masters. {status, message, data}
 */
const bulkInsertItem_master = async (req, res) => {
  try {
    if (req.body && (!Array.isArray(req.body.data) || req.body.data.length < 1)) {
      return res.badRequest();
    }
    let dataToCreate = [...req.body.data];
    for (let i = 0; i < dataToCreate.length; i++) {
      dataToCreate[i].gaushala_id = req.user.gaushala_id
    }
    let createdItem_masters = await dbService.create(Item_master, dataToCreate);
    createdItem_masters = { count: createdItem_masters ? createdItem_masters.length : 0 };
    return res.success({ data: { count: createdItem_masters.count || 0 } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find all documents of Item_master from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Item_master(s). {status, message, data}
 */
const findAllItem_master = async (req, res) => {
  try {

    let reqBody = {
      "query": {},
      "options": {
        "select": [
          "UnitType",
          "OutUnitType",
          "ExpenceType",
          "ItemId",
          "ItemName",
          "isStock",
          "isDeleted",
          "gaushala_id",
          "autoInfo"
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
    };

    let options = reqBody.options;
    let query = reqBody.query;
    query.gaushala_id = req.user.gaushala_id;


    //expence type filter
    if (Array.isArray(req.body.ExpenceType) && req.body.ExpenceType.length > 0) {
      // Add an ExpenceType condition using $in to match any of the specified values
      query.ExpenceType = {
        $in: req.body.ExpenceType,
      };
    }

    let validateRequest = validation.validateFilterWithJoi(
      reqBody,
      item_masterSchemaKey.findFilterKeys,
      Item_master.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof query === 'object' && query !== null) {
      query = { ...query };
    }
    if (reqBody.isCountOnly) {
      let totalRecords = await dbService.count(Item_master, query);
      return res.success({ data: { totalRecords } });
    }
    if (reqBody && typeof options === 'object' && options !== null) {
      options = { ...options };
    }
    let foundItem_masters = await dbService.paginate(Item_master, query, options);
    if (!foundItem_masters || !foundItem_masters.data || !foundItem_masters.data.length) {
      return res.recordNotFound();
    }

    // // Define the filter to select the documents to update
    // const filter = {};

    // // Define the update operation using $set based on the value of UnitType
    // const updateOperation = [
    //   {
    //     $set: {
    //       OutUnitType: '$UnitType', // Set OutUnitType to the value of UnitType
    //     },
    //   },
    // ];

    // // Update only the documents that meet the filter criteria
    // Item_master.updateMany(filter, updateOperation, function (err, result) {
    //     if (err) {
    //     } else {
    //     }


    //   });

    return res.success({ data: foundItem_masters });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const all_items_with_stock = async (req, res) => {

  //  ItemId TO STRING
  // COW.updateMany({}, [
  //   { $set: { tag_id : { $toString: "$tag_id" } } }
  // ], (updateErr, result) => {
  //   if (updateErr) throw updateErr;

  //   // Close the MongoDB connection

  // })

  try {

    let query = {};
    let query2 = {};
    query.gaushala_id = req.user.gaushala_id;
    query2.gaushala_id = req.user.gaushala_id;


    //expence type filter
    if (Array.isArray(req.body.ExpenceType) && req.body.ExpenceType.length > 0) {
      // Add an ExpenceType condition using $in to match any of the specified values
      query.item_type = {
        $in: req.body.ExpenceType,
      };

      query2.ExpenceType = {
        $in: req.body.ExpenceType,
      };
    }

    query2.isStock = true

    // Define the aggregation pipeline to join emp_attendance and employee collections
    const pipeline14 = [
      {
        $match: query,
      },
      {
        $lookup: {
          from: "stocks",
          localField: "ItemId",
          foreignField: "item_id",
          as: "stockData",
        },
      },
      {
        $unwind: "$stockData",
      },
      {
        $match: {
          "stockData.vendor_id": {
            $ne: "$gaushala_id", // Exclude records where vendor_id is equal to gaushala_id
          },
          "stockData.gaushala_id": query.gaushala_id
        },
      },
      {
        $group: {
          _id: {
            _id: "$_id",
            UnitType: "$UnitType",
            gaushala_id: "$gaushala_id",
            OutUnitType: "$OutUnitType",
            ExpenceType: "$ExpenceType",
            ItemId: "$ItemId",
            ItemName: "$ItemName",
            isStock: "$isStock",
            isDeleted: "$isDeleted",
          },
          stock: { $sum: "$stockData.totalWtOrQty" },
          rate: { $first: "$stockData.rate_per_unit" },
        },
      },
      {
        $addFields: {
          total_amount_of_item: { $multiply: ["$stock", "$rate"] },
        },
      },
      {
        $project: {
          UnitType: "$_id.UnitType",
          gaushala_id: "$_id.gaushala_id",
          OutUnitType: "$_id.OutUnitType",
          ExpenceType: "$_id.ExpenceType",
          ItemId: "$_id.ItemId",
          ItemName: "$_id.ItemName",
          isStock: "$_id.isStock",
          isDeleted: "$_id.isDeleted",
          total_amount_of_item: 1,
          stock: 1,
          rate: 1,
          _id: "$_id._id",
        },
      },
    ];

    const pipeline = [
      {
        $match: query
      },
      {
        $sort: {
          "createdAt": -1 // Sort in descending order based on createdAt to get the latest entry first
        }
      },
      {
        $group: {
          _id: "$item_id",
          data: { $first: "$$ROOT" } // Take the first (latest) document for each item_id
        }
      },
      {
        $lookup: {
          from: "item_masters", // Replace with your actual collection name for item_masters
          localField: "data.item_id",
          foreignField: "ItemId",
          as: "item_master"
        }
      },
      {
        $unwind: "$item_master"
      },
      {
        $match: {
          "item_master.isStock": true,
          "item_master.gaushala_id": query.gaushala_id,

        }
      },
      {
        $project: {
          stock: "$data.closing_qty_of_item",
          rate: "$data.average_price_of_item",
          total_amount_of_item: {
            $multiply: ["$data.closing_qty_of_item", "$data.average_price_of_item"]
          },
          UnitType: "$item_master.UnitType",
          gaushala_id: "$item_master.gaushala_id",
          OutUnitType: "$item_master.OutUnitType",
          ExpenceType: "$item_master.ExpenceType",
          ItemId: "$item_master.ItemId",
          ItemName: "$item_master.ItemName",
          isStock: "$item_master.isStock",
          isDeleted: "$item_master.isDeleted",
          _id: "$item_master._id"
        }
      }
    ];

    // Execute the aggregation pipeline
    const findItemStock = await report.aggregate(pipeline);


    return res.success({ data: findItemStock });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }


};

/**
 * @description : find document of Item_master from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Item_master. {status, message, data}
 */
const getItem_master = async (req, res) => {
  try {
    let query = {};
    query.gaushala_id = req.user.gaushala_id;
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message: 'invalid objectId.' });
    }
    query._id = req.params.id;
    let options = {};
    let foundItem_master = await dbService.findOne(Item_master, query, options);
    if (!foundItem_master) {
      return res.recordNotFound();
    }
    return res.success({ data: foundItem_master });
  }
  catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : returns total number of documents of Item_master.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getItem_masterCount = async (req, res) => {
  try {
    let where = {};
    where.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      item_masterSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedItem_master = await dbService.count(Item_master, where);
    return res.success({ data: { count: countedItem_master } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update document of Item_master with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Item_master.
 * @return {Object} : updated Item_master. {status, message, data}
 */
const updateItem_master = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      item_masterSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { ItemId: req.params.itemId };
    query.gaushala_id = req.user.gaushala_id;

    let updatedItem_master = await dbService.updateOne(Item_master, query, dataToUpdate);
    if (!updatedItem_master) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedItem_master });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : partially update document of Item_master with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated Item_master.
 * @return {obj} : updated Item_master. {status, message, data}
 */
const partialUpdateItem_master = async (req, res) => {
  try {
    if (!req.params.id) {
      res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      item_masterSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedItem_master = await dbService.updateOne(Item_master, query, dataToUpdate);
    if (!updatedItem_master) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedItem_master });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

module.exports = {
  all_items_with_stock,
  addItem_master,
  bulkInsertItem_master,
  findAllItem_master,
  getItem_master,
  getItem_masterCount,
  updateItem_master,
  partialUpdateItem_master
};