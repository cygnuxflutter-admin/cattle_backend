const Shed = require('../../../model/shed');
const shedSchemaKey = require('../../../utils/validation/shedValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/common');

/**
 * @description : create document of Shed in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Shed. {status, message, data}
 */
const addShed = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      shedSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    dataToCreate = new Shed(dataToCreate);
    let createdShed = await dbService.create(Shed, dataToCreate);
    return res.success({ data: createdShed });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : create multiple documents of Shed in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created Sheds. {status, message, data}
 */
const bulkInsertShed = async (req, res) => {
  try {
    if (req.body && (!Array.isArray(req.body.data) || req.body.data.length < 1)) {
      return res.badRequest();
    }
    let dataToCreate = [...req.body.data];
    let createdSheds = await dbService.create(Shed, dataToCreate);
    createdSheds = { count: createdSheds ? createdSheds.length : 0 };
    return res.success({ data: { count: createdSheds.count || 0 } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find all documents of Shed from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Shed(s). {status, message, data}
 */
const findAllShed = async (req, res) => {
  try {
    let options = {};
    let query = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      shedSchemaKey.findFilterKeys,
      Shed.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
    if (req.body.isCountOnly) {
      let totalRecords = await dbService.count(Shed, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundSheds = await dbService.paginate(Shed, query, options);
    if (!foundSheds || !foundSheds.data || !foundSheds.data.length) {
      return res.recordNotFound();
    }
    return res.success({ data: foundSheds });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find document of Shed from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Shed. {status, message, data}
 */
const getShed = async (req, res) => {
  try {
    let query = {};
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message: 'invalid objectId.' });
    }
    query._id = req.params.id;
    let options = {};
    let foundShed = await dbService.findOne(Shed, query, options);
    if (!foundShed) {
      return res.recordNotFound();
    }
    return res.success({ data: foundShed });
  }
  catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : returns total number of documents of Shed.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getShedCount = async (req, res) => {
  try {
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      shedSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedShed = await dbService.count(Shed, where);
    return res.success({ data: { count: countedShed } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update document of Shed with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Shed.
 * @return {Object} : updated Shed. {status, message, data}
 */
const updateShed = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      shedSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    const query = { _id: req.params.id };
    let updatedShed = await dbService.updateOne(Shed, query, dataToUpdate);
    if (!updatedShed) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedShed });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update multiple records of Shed with data by filter.
 * @param {Object} req : request including filter and data in request body.
 * @param {Object} res : response of updated Sheds.
 * @return {Object} : updated Sheds. {status, message, data}
 */
const bulkUpdateShed = async (req, res) => {
  try {
    let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
    let dataToUpdate = {};
    if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
      dataToUpdate = { ...req.body.data, };
    }
    let updatedShed = await dbService.updateMany(Shed, filter, dataToUpdate);
    if (!updatedShed) {
      return res.recordNotFound();
    }
    return res.success({ data: { count: updatedShed } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : partially update document of Shed with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated Shed.
 * @return {obj} : updated Shed. {status, message, data}
 */
const partialUpdateShed = async (req, res) => {
  try {
    if (!req.params.id) {
      res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      shedSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    const query = { _id: req.params.id };
    let updatedShed = await dbService.updateOne(Shed, query, dataToUpdate);
    if (!updatedShed) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedShed });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};
/**
 * @description : deactivate document of Shed from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Shed.
 * @return {Object} : deactivated Shed. {status, message, data}
 */
const softDeleteShed = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let query = { _id: req.params.id };
    const updateBody = { isDeleted: true, };
    let updatedShed = await dbService.updateOne(Shed, query, updateBody);
    if (!updatedShed) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedShed });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : delete document of Shed from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted Shed. {status, message, data}
 */
const deleteShed = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    const query = { _id: req.params.id };
    const deletedShed = await dbService.deleteOne(Shed, query);
    if (!deletedShed) {
      return res.recordNotFound();
    }
    return res.success({ data: deletedShed });

  }
  catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : delete documents of Shed in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of documents deleted.
 * @return {Object} : no of documents deleted. {status, message, data}
 */
const deleteManyShed = async (req, res) => {
  try {
    let ids = req.body.ids;
    if (!ids || !Array.isArray(ids) || ids.length < 1) {
      return res.badRequest();
    }
    const query = { _id: { $in: ids } };
    const deletedShed = await dbService.deleteMany(Shed, query);
    if (!deletedShed) {
      return res.recordNotFound();
    }
    return res.success({ data: { count: deletedShed } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};
/**
 * @description : deactivate multiple documents of Shed from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated documents of Shed.
 * @return {Object} : number of deactivated documents of Shed. {status, message, data}
 */
const softDeleteManyShed = async (req, res) => {
  try {
    let ids = req.body.ids;
    if (!ids || !Array.isArray(ids) || ids.length < 1) {
      return res.badRequest();
    }
    const query = { _id: { $in: ids } };
    const updateBody = { isDeleted: true, };
    let updatedShed = await dbService.updateMany(Shed, query, updateBody);
    if (!updatedShed) {
      return res.recordNotFound();
    }
    return res.success({ data: { count: updatedShed } });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

module.exports = {
  addShed,
  bulkInsertShed,
  findAllShed,
  getShed,
  getShedCount,
  updateShed,
  bulkUpdateShed,
  partialUpdateShed,
  softDeleteShed,
  deleteShed,
  deleteManyShed,
  softDeleteManyShed
};