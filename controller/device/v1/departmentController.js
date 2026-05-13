/**
 * departmentController.js
 * @description : exports action methods for department.
 */

const Department = require('../../../model/department');
const departmentSchemaKey = require('../../../utils/validation/departmentValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/common');

/**
 * @description : create document of Department in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Department. {status, message, data}
 */
const addDepartment = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      departmentSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    dataToCreate.gaushala_id = req.user.gaushala_id

    dataToCreate = new Department(dataToCreate);
    let createdDepartment = await dbService.create(Department, dataToCreate);
    return res.success({ data: createdDepartment });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : create multiple documents of Department in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created Departments. {status, message, data}
 */
const bulkInsertDepartment = async (req, res) => {
  try {
    if (req.body && (!Array.isArray(req.body.data) || req.body.data.length < 1)) {
      return res.badRequest();
    }
    let dataToCreate = [...req.body.data];
    for (let i = 0; i < dataToCreate.length; i++) {
      dataToCreate[i].gaushala_id = req.user.gaushala_id
    }
    let createdDepartments = await dbService.create(Department, dataToCreate);
    createdDepartments = { count: createdDepartments ? createdDepartments.length : 0 };
    return res.success({ data: { count: createdDepartments.count || 0 } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find all documents of Department from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Department(s). {status, message, data}
 */
const findAllDepartment = async (req, res) => {
  try {
    let options = {};
    let query = {};
    query.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      departmentSchemaKey.findFilterKeys,
      Department.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
    if (req.body.isCountOnly) {
      let totalRecords = await dbService.count(Department, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundDepartments = await dbService.findAll(Department, query, options);
    if (!foundDepartments) {
      return res.recordNotFound();
    }
    return res.success({ data: foundDepartments });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find document of Department from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Department. {status, message, data}
 */
const getDepartment = async (req, res) => {
  try {
    let query = {};
    query.gaushala_id = req.user.gaushala_id;
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message: 'invalid objectId.' });
    }
    query._id = req.params.id;
    let options = {};
    let foundDepartment = await dbService.findOne(Department, query, options);
    if (!foundDepartment) {
      return res.recordNotFound();
    }
    return res.success({ data: foundDepartment });
  }
  catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : returns total number of documents of Department.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getDepartmentCount = async (req, res) => {
  try {
    let where = {};
    where.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      departmentSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedDepartment = await dbService.count(Department, where);
    return res.success({ data: { count: countedDepartment } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update document of Department with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Department.
 * @return {Object} : updated Department. {status, message, data}
 */
const updateDepartment = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      departmentSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedDepartment = await dbService.updateOne(Department, query, dataToUpdate);
    if (!updatedDepartment) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedDepartment });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update multiple records of Department with data by filter.
 * @param {Object} req : request including filter and data in request body.
 * @param {Object} res : response of updated Departments.
 * @return {Object} : updated Departments. {status, message, data}
 */
const bulkUpdateDepartment = async (req, res) => {
  try {
    let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
    filter.gaushala_id = req.user.gaushala_id;
    let dataToUpdate = {};
    if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
      dataToUpdate = { ...req.body.data, };
    }
    let updatedDepartment = await dbService.updateMany(Department, filter, dataToUpdate);
    if (!updatedDepartment) {
      return res.recordNotFound();
    }
    return res.success({ data: { count: updatedDepartment } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : partially update document of Department with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated Department.
 * @return {obj} : updated Department. {status, message, data}
 */
const partialUpdateDepartment = async (req, res) => {
  try {
    if (!req.params.id) {
      res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      departmentSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedDepartment = await dbService.updateOne(Department, query, dataToUpdate);
    if (!updatedDepartment) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedDepartment });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

module.exports = {
  addDepartment,
  bulkInsertDepartment,
  findAllDepartment,
  getDepartment,
  getDepartmentCount,
  updateDepartment,
  bulkUpdateDepartment,
  partialUpdateDepartment
};  