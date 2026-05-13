/**
 * default_variableController.js
 * @description : exports action methods for default_variable.
 */

const Default_variable = require('../../../model/default_variable');
const default_variableSchemaKey = require('../../../utils/validation/default_variableValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/common');
const vendor = require('../../../model/vdr');
const item_master = require('../../../model/item_master');
const dairy_product = require('../../../model/dairy_product');
const COW = require('../../../model/COW');
const sales_items = require('../../../model/sales_items');
const department = require('../../../model/department');
const MilkUsage = require('../../../model/milk_usage');
const Milk = require('../../../model/milk');
const fs = require('fs');
const path = require('path');
const { transformArrayOfBulls } = require('../../../utils/defaultVariableFunctions');



/**
 * @description : create document of Default_variable in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Default_variable. {status, message, data}
 */
const addDefault_variable = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      default_variableSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    dataToCreate.gaushala_id = req.user.gaushala_id

    dataToCreate = new Default_variable(dataToCreate);
    let createdDefault_variable = await dbService.create(Default_variable, dataToCreate);
    return res.success({ data: createdDefault_variable });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : create multiple documents of Default_variable in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created Default_variables. {status, message, data}
 */
const bulkInsertDefault_variable = async (req, res) => {
  try {
    if (req.body && (!Array.isArray(req.body.data) || req.body.data.length < 1)) {
      return res.badRequest();
    }
    let dataToCreate = [...req.body.data];
    for (let i = 0; i < dataToCreate.length; i++) {
      dataToCreate[i].gaushala_id = req.user.gaushala_id
    }
    let createdDefault_variables = await dbService.create(Default_variable, dataToCreate);
    createdDefault_variables = { count: createdDefault_variables ? createdDefault_variables.length : 0 };
    return res.success({ data: { count: createdDefault_variables.count || 0 } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find all documents of Default_variable from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Default_variable(s). {status, message, data}
 */
const findAllDefault_variable = async (req, res) => {
  try {

    // let reqBody = {
    //   "query": {},
    //   "options": {
    //     "select": [
    //       "default_id",
    //       "value",
    //       "group"
    //     ],
    //     "collation": "",
    //     "sort": "",
    //     "populate": "",
    //     "projection": "",
    //     "lean": false,
    //     "leanWithId": true,
    //     "offset": 0,
    //     "page": 1,
    //     "limit": 10,
    //     "pagination": false,
    //     "useEstimatedCount": false,
    //     "useCustomCountFn": false,
    //     "forceCountFn": false,
    //     "read": {},
    //     "options": {}
    //   },
    //   "isCountOnly": false
    // }

    let options = {};
    let query = {};
    // query.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      default_variableSchemaKey.findFilterKeys,
      Default_variable.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
    if (req.body.isCountOnly) {
      let totalRecords = await dbService.count(Default_variable, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundDefault_variables = await dbService.findAll(Default_variable, query, options);
    if (!foundDefault_variables) {
      return res.recordNotFound();
    }
    return res.success({ data: foundDefault_variables });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find document of Default_variable from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Default_variable. {status, message, data}
 */
const getDefault_variable = async (req, res) => {
  try {
    let query = {};
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message: 'invalid objectId.' });
    }
    query._id = req.params.id;
    query.gaushala_id = req.user.gaushala_id;
    let options = {};
    let foundDefault_variable = await dbService.findOne(Default_variable, query, options);
    if (!foundDefault_variable) {
      return res.recordNotFound();
    }
    return res.success({ data: foundDefault_variable });
  }
  catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : returns total number of documents of Default_variable.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getDefault_variableCount = async (req, res) => {
  try {
    let where = {};
    where.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      default_variableSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedDefault_variable = await dbService.count(Default_variable, where);
    return res.success({ data: { count: countedDefault_variable } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update document of Default_variable with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Default_variable.
 * @return {Object} : updated Default_variable. {status, message, data}
 */
const updateDefault_variable = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      default_variableSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedDefault_variable = await dbService.updateOne(Default_variable, query, dataToUpdate);
    if (!updatedDefault_variable) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedDefault_variable });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update multiple records of Default_variable with data by filter.
 * @param {Object} req : request including filter and data in request body.
 * @param {Object} res : response of updated Default_variables.
 * @return {Object} : updated Default_variables. {status, message, data}
 */
const bulkUpdateDefault_variable = async (req, res) => {
  try {
    let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
    filter.gaushala_id = req.user.gaushala_id;
    let dataToUpdate = {};
    if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
      dataToUpdate = { ...req.body.data, };
    }
    let updatedDefault_variable = await dbService.updateMany(Default_variable, filter, dataToUpdate);
    if (!updatedDefault_variable) {
      return res.recordNotFound();
    }
    return res.success({ data: { count: updatedDefault_variable } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : partially update document of Default_variable with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated Default_variable.
 * @return {obj} : updated Default_variable. {status, message, data}
 */
const partialUpdateDefault_variable = async (req, res) => {
  try {
    if (!req.params.id) {
      res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      default_variableSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    //query.gaushala_id = req.user.gaushala_id;
    let updatedDefault_variable = await dbService.updateOne(Default_variable, query, dataToUpdate);
    if (!updatedDefault_variable) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedDefault_variable });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

// 
const bulls = async (req, res) => {

  try {

    const gaushala_id = req.user.gaushala_id

    const bullsForTransform = await dbService.findAll(COW, { isFemale: false, type: "Bull", gaushala_id: gaushala_id });
    const bulls = transformArrayOfBulls(bullsForTransform);

    return res.success({ data: bulls });


  } catch (error) {
    return res.internalServerError({ message: error.message });
  }


};

const getDefault_stock_items = async (req, res) => {
  try {
    let query = {};
    let options = {};
    //query.gaushala_id = req.user.gaushala_id;
    query.group = 'stock_items';
    let foundDefault_variables = await dbService.findAll(Default_variable, query, options);

    if (!foundDefault_variables || !foundDefault_variables.length) {
      return res.recordNotFound();
    }

    return res.success({ data: foundDefault_variables });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
}

const getDefault_sheds = async (req, res) => {
  try {
    let query = {};
    let options = {};
    query.gaushala_id = req.user.gaushala_id;
    query.group = 'sheds';
    let foundDefault_variables = await dbService.findAll(Default_variable, query, options);

    if (!foundDefault_variables || !foundDefault_variables.length) {
      return res.recordNotFound();
    }

    return res.success({ data: foundDefault_variables });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }

}

const getDefualt_cowTypes = async (req, res) => {
  try {
    let query = {};
    let options = {};
    //query.gaushala_id = req.user.gaushala_id;
    query.group = 'cowTypes';
    let foundDefault_variables = await dbService.findAll(Default_variable, query, options);

    if (!foundDefault_variables || !foundDefault_variables.length) {
      return res.recordNotFound();
    }

    return res.success({ data: foundDefault_variables });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }

}

const getDefualt_breeds = async (req, res) => {
  try {
    let query = {};
    let options = {};
    //query.gaushala_id = req.user.gaushala_id;
    query.group = 'breeds';
    let foundDefault_variables = await dbService.findAll(Default_variable, query, options);

    if (!foundDefault_variables || !foundDefault_variables.length) {
      return res.recordNotFound();
    }

    return res.success({ data: foundDefault_variables });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }

}

const getDefault_distribution_free_person = async (req, res) => {
  try {
    let query = {};
    let options = {};
    query.gaushala_id = req.user.gaushala_id;
    query.group = 'distribution_free_person';
    let foundDefault_variables = await dbService.findAll(Default_variable, query, options);

    if (!foundDefault_variables || !foundDefault_variables.length) {
      return res.recordNotFound();
    }

    return res.success({ data: foundDefault_variables });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }

}

const getDefault_expense_types = async (req, res) => {
  try {
    let query = {};
    let options = {};
    //query.gaushala_id = req.user.gaushala_id;
    query.group = 'expense_types';
    let foundDefault_variables = await dbService.findAll(Default_variable, query, options);

    if (!foundDefault_variables || !foundDefault_variables.length) {
      return res.recordNotFound();
    }

    return res.success({ data: foundDefault_variables });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }

}

const getDefault_vehicles = async (req, res) => {
  try {

    let query = {};
    let options = {};

    query.gaushala_id = req.user.gaushala_id;
    query.group = 'vehicles';
    let foundDefault_variables = await dbService.findAll(Default_variable, query, options);

    if (!foundDefault_variables || !foundDefault_variables.length) {
      return res.recordNotFound();
    }

    return res.success({ data: foundDefault_variables });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }

}

module.exports = {
  bulls,
  addDefault_variable,
  bulkInsertDefault_variable,
  findAllDefault_variable,
  getDefault_variable,
  getDefault_variableCount,
  updateDefault_variable,
  bulkUpdateDefault_variable,
  partialUpdateDefault_variable,
  getDefault_stock_items,
  getDefualt_breeds,
  getDefault_sheds,
  getDefualt_cowTypes,
  getDefault_distribution_free_person,
  getDefault_expense_types,
  getDefault_vehicles
};