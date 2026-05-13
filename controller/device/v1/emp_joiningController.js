/**
 * emp_joiningController.js
 * @description : exports action methods for emp_joining.
 */

const Emp_joining = require('../../../model/emp_joining');
const emp_joiningSchemaKey = require('../../../utils/validation/emp_joiningValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/common');
const emp_attendance = require('../../../model/emp_attendance');

/**
 * @description : create document of Emp_joining in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Emp_joining. {status, message, data}
 */
const addEmp_joining = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      emp_joiningSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    dataToCreate.gaushala_id = req.user.gaushala_id
    dataToCreate = new Emp_joining(dataToCreate);
    let createdEmp_joining = await dbService.create(Emp_joining, dataToCreate);
    return res.success({ data: createdEmp_joining });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : create multiple documents of Emp_joining in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created Emp_joinings. {status, message, data}
 */
const bulkInsertEmp_joining = async (req, res) => {
  try {
    if (req.body && (!Array.isArray(req.body.data) || req.body.data.length < 1)) {
      return res.badRequest();
    }
    let dataToCreate = [...req.body.data];

    for (let i = 0; i < dataToCreate.length; i++) {
      dataToCreate[i].gaushala_id = req.user.gaushala_id
    }

    let createdEmp_joinings = await dbService.create(Emp_joining, dataToCreate);
    createdEmp_joinings = { count: createdEmp_joinings ? createdEmp_joinings.length : 0 };
    return res.success({ data: { count: createdEmp_joinings.count || 0 } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find all documents of Emp_joining from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Emp_joining(s). {status, message, data}
 */

const findAllEmp_joining = async (req, res) => {
  try {
    // Your existing code to parse request and validate input goes here...

    // Define the aggregation pipeline to join emp_joining and employee collections
    const gaushala_id = req.user.gaushala_id;
    const pipeline = [
      {
        $match: {
          "leave_date": "NA",
          "gaushala_id": gaushala_id
        }
      }
      ,
      {
        $lookup: {
          from: "employees", // The name of the employee collection
          localField: "emp_id",
          foreignField: "emp_id",
          as: "employeeData"
        }
      },
      {
        $unwind: "$employeeData" // Unwind the array created by $lookup
      },
      {
        $match: {
          "employeeData.gaushala_id": gaushala_id
        }
      },
      {
        $project: {
          "emp_id": 1,
          "join_date": 1,
          "leave_date": 1,
          "remark": 1,
          "isActive": "$employeeData.isActive",
          "id": "$_id",
          "payroll_name": "$employeeData.payroll_name" // Include employee's payroll_name
        }
      }
    ];

    // Execute the aggregation pipeline
    const foundEmp_joinings = await Emp_joining.aggregate(pipeline);

    if (!foundEmp_joinings) {
      return res.recordNotFound();
    }

    return res.success({ data: foundEmp_joinings });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};


/**
 * @description : find document of Emp_joining from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Emp_joining. {status, message, data}
 */
const getEmp_joining = async (req, res) => {
  try {
    let query = {};
    query.gaushala_id = req.user.gaushala_id;
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message: 'invalid objectId.' });
    }
    query._id = req.params.id;
    let options = {};
    let foundEmp_joining = await dbService.findOne(Emp_joining, query, options);
    if (!foundEmp_joining) {
      return res.recordNotFound();
    }
    return res.success({ data: foundEmp_joining });
  }
  catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : returns total number of documents of Emp_joining.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getEmp_joiningCount = async (req, res) => {
  try {
    let where = {};
    where.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      emp_joiningSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedEmp_joining = await dbService.count(Emp_joining, where);
    return res.success({ data: { count: countedEmp_joining } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update document of Emp_joining with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Emp_joining.
 * @return {Object} : updated Emp_joining. {status, message, data}
 */
const updateEmp_joining = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      emp_joiningSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedEmp_joining = await dbService.updateOne(Emp_joining, query, dataToUpdate);
    if (!updatedEmp_joining) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedEmp_joining });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : partially update document of Emp_joining with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated Emp_joining.
 * @return {obj} : updated Emp_joining. {status, message, data}
 */
const partialUpdateEmp_joining = async (req, res) => {
  try {
    if (!req.params.id) {
      res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      emp_joiningSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedEmp_joining = await dbService.updateOne(Emp_joining, query, dataToUpdate);
    if (!updatedEmp_joining) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedEmp_joining });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

module.exports = {
  addEmp_joining,
  bulkInsertEmp_joining,
  findAllEmp_joining,
  getEmp_joining,
  getEmp_joiningCount,
  updateEmp_joining,
  partialUpdateEmp_joining
};