/**
 * dairy_productController.js
 * @description : exports action methods for dairy_product.
 */

const Dairy_product = require('../../../model/dairy_product');
const dairy_productSchemaKey = require('../../../utils/validation/dairy_productValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/common');

/**
 * @description : create document of Dairy_product in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Dairy_product. {status, message, data}
 */
const addDairy_product = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      dairy_productSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    dataToCreate.gaushala_id = req.user.gaushala_id

    dataToCreate = new Dairy_product(dataToCreate);
    let createdDairy_product = await dbService.create(Dairy_product, dataToCreate);
    return res.success({ data: createdDairy_product });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : create multiple documents of Dairy_product in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created Dairy_products. {status, message, data}
 */
const bulkInsertDairy_product = async (req, res) => {
  try {
    if (req.body && (!Array.isArray(req.body.data) || req.body.data.length < 1)) {
      return res.badRequest();
    }
    let dataToCreate = [...req.body.data];
    for (let i = 0; i < dataToCreate.length; i++) {
      dataToCreate[i].gaushala_id = req.user.gaushala_id
    }
    let createdDairy_products = await dbService.create(Dairy_product, dataToCreate);
    createdDairy_products = { count: createdDairy_products ? createdDairy_products.length : 0 };
    return res.success({ data: { count: createdDairy_products.count || 0 } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find all documents of Dairy_product from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Dairy_product(s). {status, message, data}
 */
const findAllDairy_product = async (req, res) => {
  try {
    const reqBody = {
      "query": {},
      "options": {
        "select": [
          "item_name"
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
    let query = {};
    query.gaushala_id = req.user.gaushala_id
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      dairy_productSchemaKey.findFilterKeys,
      Dairy_product.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
    if (req.body.isCountOnly) {
      let totalRecords = await dbService.count(Dairy_product, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundDairy_products = await dbService.findAll(Dairy_product, query, options);
    if (!foundDairy_products || foundDairy_products.length == 0) {
      return res.recordNotFound();
    }
    return res.success({ data: foundDairy_products });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find document of Dairy_product from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Dairy_product. {status, message, data}
 */
const getDairy_product = async (req, res) => {
  try {
    let query = {};
    query.gaushala_id = req.user.gaushala_id
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message: 'invalid objectId.' });
    }
    query._id = req.params.id;
    let options = {};
    let foundDairy_product = await dbService.findOne(Dairy_product, query, options);
    if (!foundDairy_product) {
      return res.recordNotFound();
    }
    return res.success({ data: foundDairy_product });
  }
  catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : returns total number of documents of Dairy_product.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getDairy_productCount = async (req, res) => {
  try {
    let where = {};
    where.gaushala_id = req.user.gaushala_id
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      dairy_productSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedDairy_product = await dbService.count(Dairy_product, where);
    return res.success({ data: { count: countedDairy_product } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update document of Dairy_product with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Dairy_product.
 * @return {Object} : updated Dairy_product. {status, message, data}
 */
const updateDairy_product = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      dairy_productSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id
    let updatedDairy_product = await dbService.updateOne(Dairy_product, query, dataToUpdate);
    if (!updatedDairy_product) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedDairy_product });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : partially update document of Dairy_product with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated Dairy_product.
 * @return {obj} : updated Dairy_product. {status, message, data}
 */
const partialUpdateDairy_product = async (req, res) => {
  try {
    if (!req.params.id) {
      res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      dairy_productSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id
    let updatedDairy_product = await dbService.updateOne(Dairy_product, query, dataToUpdate);
    if (!updatedDairy_product) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedDairy_product });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

module.exports = {
  addDairy_product,
  bulkInsertDairy_product,
  findAllDairy_product,
  getDairy_product,
  getDairy_productCount,
  updateDairy_product,
  partialUpdateDairy_product
};