/**
 * emp_leaveController.js
 * @description : exports action methods for emp_leave.
 */

const Emp_leave = require('../../../model/emp_leave');
const Emp_attendance = require('../../../model/emp_attendance');

const emp_leaveSchemaKey = require('../../../utils/validation/emp_leaveValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/common');

/**
 * @description : create document of Emp_leave in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Emp_leave. {status, message, data}
 */
const addEmp_leave = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      emp_leaveSchemaKey.schemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({
        message: `Invalid values in parameters, ${validateRequest.message}`,
      });
    }

    // Parse "from" and "to" dates directly
    const fromDate = new Date(dataToCreate.from);
    const toDate = new Date(dataToCreate.to);

    // Create attendance records for each date in the date range
    const attendanceRecords = [];
    for (let currentDate = fromDate; currentDate <= toDate; currentDate.setDate(currentDate.getDate() + 1)) {
      let dataToCreateForAttendance = {
        emp_id: dataToCreate.emp_id,
        gaushala_id: req.user.gaushala_id,
        date: currentDate.toISOString().split('T')[0], // Use ISO format (YYYY-MM-DD)
        attendanceType: dataToCreate.attendanceType,
        leaveType: dataToCreate.leaveType,
        remark: dataToCreate.remark,
      };
      attendanceRecords.push(dataToCreateForAttendance);
    }
    dataToCreate.gaushala_id = req.user.gaushala_id

    // Create Emp_leave record
    dataToCreate = new Emp_leave(dataToCreate);
    let createdEmp_leave = await dbService.create(Emp_leave, dataToCreate);

    // Create Emp_attendance records for each date in the date range
    for (const attendanceRecord of attendanceRecords) {
      await dbService.create(Emp_attendance, attendanceRecord);
    }

    return res.success({ data: createdEmp_leave });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};


/**
 * @description : find all documents of Emp_leave from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Emp_leave(s). {status, message, data}
 */
const findAllEmp_leave = async (req, res) => {
  try {
    let options = {};
    let query = {};
    query.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      emp_leaveSchemaKey.findFilterKeys,
      Emp_leave.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
    if (req.body.isCountOnly) {
      let totalRecords = await dbService.count(Emp_leave, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundEmp_leaves = await dbService.paginate(Emp_leave, query, options);
    if (!foundEmp_leaves || !foundEmp_leaves.data || !foundEmp_leaves.data.length) {
      return res.recordNotFound();
    }
    return res.success({ data: foundEmp_leaves });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find document of Emp_leave from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Emp_leave. {status, message, data}
 */
const getEmp_leave = async (req, res) => {
  try {
    let query = {};
    query.gaushala_id = req.user.gaushala_id;
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message: 'invalid objectId.' });
    }
    query._id = req.params.id;
    let options = {};
    let foundEmp_leave = await dbService.findOne(Emp_leave, query, options);
    if (!foundEmp_leave) {
      return res.recordNotFound();
    }
    return res.success({ data: foundEmp_leave });
  }
  catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : returns total number of documents of Emp_leave.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getEmp_leaveCount = async (req, res) => {
  try {
    let where = {};
    where.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      emp_leaveSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedEmp_leave = await dbService.count(Emp_leave, where);
    return res.success({ data: { count: countedEmp_leave } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update document of Emp_leave with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Emp_leave.
 * @return {Object} : updated Emp_leave. {status, message, data}
 */
const updateEmp_leave = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      emp_leaveSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedEmp_leave = await dbService.updateOne(Emp_leave, query, dataToUpdate);
    if (!updatedEmp_leave) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedEmp_leave });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : partially update document of Emp_leave with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated Emp_leave.
 * @return {obj} : updated Emp_leave. {status, message, data}
 */
const partialUpdateEmp_leave = async (req, res) => {
  try {
    if (!req.params.id) {
      res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      emp_leaveSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedEmp_leave = await dbService.updateOne(Emp_leave, query, dataToUpdate);
    if (!updatedEmp_leave) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedEmp_leave });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

module.exports = {
  addEmp_leave,
  findAllEmp_leave,
  getEmp_leave,
  getEmp_leaveCount,
  updateEmp_leave,
  partialUpdateEmp_leave
};