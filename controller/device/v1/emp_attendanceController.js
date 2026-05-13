/**
 * emp_attendanceController.js
 * @description : exports action methods for emp_attendance.
 */

const Emp_attendance = require('../../../model/emp_attendance');
const emp_attendanceSchemaKey = require('../../../utils/validation/emp_attendanceValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/common');
const report = require('../../../model/report');
const emp_attendance = require('../../../model/emp_attendance');
const emp_joining = require('../../../model/emp_joining');


//absent 
const findAllAbsent_emp = async (req, res) => {
  try {
    // Extract the date from the request body
    const date = req.body.date;
    const gaushala_id = req.user.gaushala_id;

    // Define the aggregation pipeline to join emp_attendance and employee collections
    const pipeline = [
      {
        $match: {
          "date": date,
          "gaushala_id": gaushala_id
        }
      },
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
          "date": 1,
          "attendanceType": 1,
          "leaveType": 1,
          "remark": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "isDeleted": 1,
          "id": "$_id",
          "gender": "$employeeData.gender",
          "payroll_name": "$employeeData.payroll_name" // Include employee's payroll_name
        }
      }
    ];

    // Execute the aggregation pipeline
    const foundAbsentEmployees = await Emp_attendance.aggregate(pipeline);

    if (!foundAbsentEmployees || foundAbsentEmployees.length <= 0) {
      return res.recordNotFound();
    }

    return res.success({ data: foundAbsentEmployees });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : create document of Emp_attendance in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Emp_attendance. {status, message, data}
 */
const addEmp_attendance = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      emp_attendanceSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    dataToCreate.gaushala_id = req.user.gaushala_id
    dataToCreate = new Emp_attendance(dataToCreate);
    let createdEmp_attendance = await dbService.create(Emp_attendance, dataToCreate);
    return res.success({ data: createdEmp_attendance });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : create multiple documents of Emp_attendance in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created Emp_attendances. {status, message, data}
 */
const bulkInsertEmp_attendance = async (req, res) => {
  try {
    if (req.body && (!Array.isArray(req.body.data) || req.body.data.length < 1)) {
      return res.badRequest();
    }
    let dataToCreate = [...req.body.data];
    for (let i = 0; i < dataToCreate.length; i++) {
      dataToCreate[i].gaushala_id = req.user.gaushala_id;
    }
    let createdEmp_attendances = await dbService.create(Emp_attendance, dataToCreate);
    createdEmp_attendances = { count: createdEmp_attendances ? createdEmp_attendances.length : 0 };
    return res.success({ data: { count: createdEmp_attendances.count || 0 } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find all documents of Emp_attendance from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Emp_attendance(s). {status, message, data}
 */
// const findAllEmp_attendance = async (req, res) => {
//   try {

//     let reqBody = {
//       "query": {},
//       "options": {
//         "select": [
//           "emp_id",
//           "date",
//           "attendanceType",
//           "leaveType",
//           "remark"
//         ],
//         "collation": "",
//         "sort": "",
//         "populate": "",
//         "projection": "",
//         "lean": false,
//         "leanWithId": true,
//         "offset": 0,
//         "page": 1,
//         "limit": 10,
//         "pagination": false,
//         "useEstimatedCount": false,
//         "useCustomCountFn": false,
//         "forceCountFn": false,
//         "read": {},
//         "options": {}
//       },
//       "isCountOnly": false
//     }; 

//     // date range filter
//     let options = reqBody.options;
//     let query = reqBody.query;


//     if (req.body.startDate && req.body.endDate) {
//       // Convert the date strings to Date objects
//       const startDate = req.body.startDate;
//       const endDate = req.body.endDate;

//       // Add a date range condition to the query
//       query.date = {
//         $gte: startDate,
//         $lte: endDate,
//       };
//     }

//     // Check if the user has provided an emp_id filter as an array
//     if (Array.isArray(req.body.emp_id) && req.body.emp_id.length > 0) {
//       // Add an emp_id condition using $in to match any of the specified values
//       query.emp_id = {
//         $in: req.body.emp_id,
//       };
//     }

//     let validateRequest = validation.validateFilterWithJoi(
//       reqBody,
//       emp_attendanceSchemaKey.findFilterKeys,
//       Emp_attendance.schema.obj
//     );
//     if (!validateRequest.isValid) {
//       return res.validationError({ message: `${validateRequest.message}` });
//     }
//     if (typeof reqBody.query === 'object' && reqBody.query !== null) {
//       query = { ...reqBody.query };
//     }
//     if (reqBody.isCountOnly) {
//       let totalRecords = await dbService.count(Emp_attendance, query);
//       return res.success({ data: { totalRecords } });
//     }
//     if (reqBody && typeof reqBody.options === 'object' && reqBody.options !== null) {
//       options = { ...reqBody.options };
//     }
//     let foundEmp_attendances = await dbService.findAll(Emp_attendance, query, options);
//     if (!foundEmp_attendances || foundEmp_attendances.length == 0) {
//       return res.recordNotFound();
//     }
//     return res.success({ data: foundEmp_attendances });
//   } catch (error) {
//     return res.internalServerError({ message: error.message });
//   }
// };

const findAllEmp_attendance = async (req, res) => {
  try {
    // const fieldToAdd = { gaushala_id: '01' }; // Replace with the desired gaushala_id value

    // // Update all documents in the collection
    // emp_joining.updateMany({}, { $set: fieldToAdd }, (updateErr, result) => {
    //   if (updateErr) {
    //   } else {
    //   }
    // });

    // Your existing code to parse request and validate input goes here...
    let query = {};
    query.gaushala_id = req.user.gaushala_id;

    if (req.body.startDate && req.body.endDate) {
      // Convert the date strings to Date objects
      const startDate = req.body.startDate;
      const endDate = req.body.endDate;

      // Add a date range condition to the query
      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // Check if the user has provided an emp_id filter as an array
    if (Array.isArray(req.body.emp_id) && req.body.emp_id.length > 0) {
      // Add an emp_id condition using $in to match any of the specified values
      query.emp_id = {
        $in: req.body.emp_id,
      };
    }

    // Define the aggregation pipeline to join emp_attendance and employee collections
    const pipeline = [
      {
        $match: query
      },
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
          "employeeData.gaushala_id": query.gaushala_id
        }
      },
      {
        $project: {
          "emp_id": 1,
          "date": 1,
          "attendanceType": 1,
          "leaveType": 1,
          "remark": 1,
          "id": "$_id",
          "payroll_name": "$employeeData.payroll_name", // Include employee's payroll_name
          "gender": "$employeeData.gender"
        }
      }
    ];

    // Execute the aggregation pipeline
    const foundEmpAttendances = await Emp_attendance.aggregate(pipeline);

    if (!foundEmpAttendances || foundEmpAttendances.length == 0) {
      return res.status(200).json({
        message: "RECORD_NOT_FOUND",
        status: "SUCCESS",
        data: []
      })
    }

    return res.success({ data: foundEmpAttendances });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};


/**
 * @description : find document of Emp_attendance from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Emp_attendance. {status, message, data}
 */
const getEmp_attendance = async (req, res) => {
  try {
    let query = {};
    query.gaushala_id = req.user.gaushala_id;
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message: 'invalid objectId.' });
    }
    query._id = req.params.id;
    let options = {};
    let foundEmp_attendance = await dbService.findOne(Emp_attendance, query, options);
    if (!foundEmp_attendance) {
      return res.recordNotFound();
    }
    return res.success({ data: foundEmp_attendance });
  }
  catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : returns total number of documents of Emp_attendance.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getEmp_attendanceCount = async (req, res) => {
  try {
    let where = {};
    where.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      emp_attendanceSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedEmp_attendance = await dbService.count(Emp_attendance, where);
    return res.success({ data: { count: countedEmp_attendance } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update document of Emp_attendance with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Emp_attendance.
 * @return {Object} : updated Emp_attendance. {status, message, data}
 */
const updateEmp_attendance = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      emp_attendanceSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedEmp_attendance = await dbService.updateOne(Emp_attendance, query, dataToUpdate);
    if (!updatedEmp_attendance) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedEmp_attendance });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : partially update document of Emp_attendance with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated Emp_attendance.
 * @return {obj} : updated Emp_attendance. {status, message, data}
 */
const partialUpdateEmp_attendance = async (req, res) => {
  try {
    if (!req.params.id) {
      res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      emp_attendanceSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedEmp_attendance = await dbService.updateOne(Emp_attendance, query, dataToUpdate);
    if (!updatedEmp_attendance) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedEmp_attendance });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

module.exports = {
  findAllAbsent_emp,
  addEmp_attendance,
  bulkInsertEmp_attendance,
  findAllEmp_attendance,
  getEmp_attendance,
  getEmp_attendanceCount,
  updateEmp_attendance,
  partialUpdateEmp_attendance
};