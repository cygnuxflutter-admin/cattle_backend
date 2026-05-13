/**
 * shedTransferHistoryController.js
 * @description : exports action methods for shedTransferHistory.
 */

const ShedTransferHistory = require('../../../model/shedTransferHistory');
const COW = require('../../../model/COW');
const shedTransferHistorySchemaKey = require('../../../utils/validation/shedTransferHistoryValidation');
const COWSchemaKey = require('../../../utils/validation/COWValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/common');
const COWController = require('./COWController');

/**
 * @description : create document of ShedTransferHistory in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created ShedTransferHistory. {status, message, data}
 */

const combinedCoWndShedTransfer = async (req, res) => {
  try {
    let dataToCreateShed = {};
    let dataToCreate = {};

    dataToCreateShed = { ...req.body.shed || {} };
    dataToCreate = { ...req.body.cow || {} };

    let validateRequestShed = validation.validateParamsWithJoi(
      dataToCreateShed,
      shedTransferHistorySchemaKey.schemaKeys);
    if (!validateRequestShed.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequestShed.message}` });
    }

    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      COWSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    dataToCreateShed.gaushala_id = req.user.gaushala_id
    dataToCreate.gaushala_id = req.user.gaushala_id

    foundCOW = await dbService.findOne(COW, { tag_id: dataToCreate.tag_id, gaushala_id: dataToCreate.gaushala_id });

    if (foundCOW) {
      return res.validationError({ message: `A record with tag_id '${dataToCreate.tag_id}' already exists.` });
    }


    dataToCreate.addedBy = req.user.id;
    dataToCreate = new COW(dataToCreate);
    let createdCOW = await dbService.create(COW, dataToCreate);

    dataToCreateShed = new ShedTransferHistory(dataToCreateShed);
    let createdShedTransferHistory = await dbService.create(ShedTransferHistory, dataToCreateShed);

    return res.success({ data: { createdShedTransferHistory, createdCOW } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const addShedTransferHistory = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      shedTransferHistorySchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    dataToCreate = new ShedTransferHistory(dataToCreate);
    let createdShedTransferHistory = await dbService.create(ShedTransferHistory, dataToCreate);
    return res.success({ data: createdShedTransferHistory });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find all documents of ShedTransferHistory from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found ShedTransferHistory(s). {status, message, data}
 */
const findAllShedTransferHistory = async (req, res) => {
  try {
    let options = {};
    let query = {};
    query.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      shedTransferHistorySchemaKey.findFilterKeys,
      ShedTransferHistory.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
    if (req.body.isCountOnly) {
      let totalRecords = await dbService.count(ShedTransferHistory, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundShedTransferHistorys = await dbService.paginate(ShedTransferHistory, query, options);
    if (!foundShedTransferHistorys || !foundShedTransferHistorys.data || !foundShedTransferHistorys.data.length) {
      return res.recordNotFound();
    }

    return res.success({ data: foundShedTransferHistorys });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find document of ShedTransferHistory from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found ShedTransferHistory. {status, message, data}
 */
const getShedTransferHistory = async (req, res) => {
  try {
    let query = {};
    query.gaushala_id = req.user.gaushala_id;
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message: 'invalid objectId.' });
    }
    query._id = req.params.id;
    let options = {};
    let foundShedTransferHistory = await dbService.findOne(ShedTransferHistory, query, options);
    if (!foundShedTransferHistory) {
      return res.recordNotFound();
    }
    return res.success({ data: foundShedTransferHistory });
  }
  catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : returns total number of documents of ShedTransferHistory.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getShedTransferHistoryCount = async (req, res) => {
  try {
    let where = {};
    where.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      shedTransferHistorySchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedShedTransferHistory = await dbService.count(ShedTransferHistory, where);
    return res.success({ data: { count: countedShedTransferHistory } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update document of ShedTransferHistory with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated ShedTransferHistory.
 * @return {Object} : updated ShedTransferHistory. {status, message, data}
 */
const updateShedTransferHistory = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      shedTransferHistorySchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedShedTransferHistory = await dbService.updateOne(ShedTransferHistory, query, dataToUpdate);
    if (!updatedShedTransferHistory) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedShedTransferHistory });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : partially update document of ShedTransferHistory with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated ShedTransferHistory.
 * @return {obj} : updated ShedTransferHistory. {status, message, data}
 */
const partialUpdateShedTransferHistory = async (req, res) => {
  try {
    if (!req.params.id) {
      res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      shedTransferHistorySchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedShedTransferHistory = await dbService.updateOne(ShedTransferHistory, query, dataToUpdate);
    if (!updatedShedTransferHistory) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedShedTransferHistory });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

module.exports = {
  combinedCoWndShedTransfer,
  addShedTransferHistory,
  findAllShedTransferHistory,
  getShedTransferHistory,
  getShedTransferHistoryCount,
  updateShedTransferHistory,
  partialUpdateShedTransferHistory
};