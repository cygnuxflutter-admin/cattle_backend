/**
 * milk_historyController.js
 * @description : exports action methods for milk_history.
 */

const Milk_history = require('../../../model/milk_history');
const milk_historySchemaKey = require('../../../utils/validation/milk_historyValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/common');

/**
 * @description : create document of Milk_history in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Milk_history. {status, message, data}
 */
const addMilk_history = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      milk_historySchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    dataToCreate.gaushala_id = req.user.gaushala_id

    dataToCreate = new Milk_history(dataToCreate);
    let createdMilk_history = await dbService.create(Milk_history, dataToCreate);
    return res.success({ data: createdMilk_history });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find all documents of Milk_history from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Milk_history(s). {status, message, data}
 */
const findAllMilk_history = async (req, res) => {
  try {
    let options = {};
    let query = {};
    query.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      milk_historySchemaKey.findFilterKeys,
      Milk_history.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
    if (req.body.isCountOnly) {
      let totalRecords = await dbService.count(Milk_history, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundMilk_historys = await dbService.paginate(Milk_history, query, options);
    if (!foundMilk_historys || !foundMilk_historys.data || !foundMilk_historys.data.length) {
      return res.recordNotFound();
    }
    return res.success({ data: foundMilk_historys });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find document of Milk_history from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Milk_history. {status, message, data}
 */
const getMilk_history = async (req, res) => {
  try {
    let query = {};
    query.gaushala_id = req.user.gaushala_id;
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message: 'invalid objectId.' });
    }
    query._id = req.params.id;
    let options = {};
    let foundMilk_history = await dbService.findOne(Milk_history, query, options);
    if (!foundMilk_history) {
      return res.recordNotFound();
    }
    return res.success({ data: foundMilk_history });
  }
  catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : returns total number of documents of Milk_history.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getMilk_historyCount = async (req, res) => {
  try {
    let where = {};
    where.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      milk_historySchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedMilk_history = await dbService.count(Milk_history, where);
    return res.success({ data: { count: countedMilk_history } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update document of Milk_history with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Milk_history.
 * @return {Object} : updated Milk_history. {status, message, data}
 */
const updateMilk_history = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      milk_historySchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedMilk_history = await dbService.updateOne(Milk_history, query, dataToUpdate);
    if (!updatedMilk_history) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedMilk_history });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : partially update document of Milk_history with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated Milk_history.
 * @return {obj} : updated Milk_history. {status, message, data}
 */
const partialUpdateMilk_history = async (req, res) => {
  try {
    if (!req.params.id) {
      res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      milk_historySchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedMilk_history = await dbService.updateOne(Milk_history, query, dataToUpdate);
    if (!updatedMilk_history) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedMilk_history });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

module.exports = {
  addMilk_history,
  findAllMilk_history,
  getMilk_history,
  getMilk_historyCount,
  updateMilk_history,
  partialUpdateMilk_history
};