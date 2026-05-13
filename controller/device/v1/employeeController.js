/**
 * employeeController.js
 * @description : exports action methods for employee.
 */

const Employee = require('../../../model/employee');
const emp_attendance = require('../../../model/emp_attendance');
const employeeSchemaKey = require('../../../utils/validation/employeeValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const emp_joining = require('../../../model/emp_joining');
const employee = require('../../../model/employee');
const { GAUSHALA_EMP_CODE } = require('../../../constants/authConstant');

/**
 * @description : create document of Employee in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Employee. {status, message, data}
 */
const addEmployee = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      employeeSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }

    const gaushala_id = req.user.gaushala_id

    // Find the last employee by sorting in descending order based on emp_id
    //const lastEmployee = await dbService.findOne(Employee, { gaushala_id: req.user.gaushala_id }, { createdAt: 0 });
    const lastEmployee = await Employee.findOne({ gaushala_id: gaushala_id, emp_id: { $not: /T/i } }).sort({ createdAt: -1 });

    let empCode = GAUSHALA_EMP_CODE[gaushala_id];

    if (!empCode) {
      return res.badRequest({ data: `GAUSHALA_EMP_CODE not found for this gaushala ${gaushala_id}` });
    }

    let lastEmpId = 0;
    if (lastEmployee) {
      // Parse the numeric part of the emp_id and convert it to a number
      const lastEmpIdNumericPart = parseInt(lastEmployee.emp_id.split('-')[1]);
      lastEmpId = isNaN(lastEmpIdNumericPart) ? 0 : lastEmpIdNumericPart;
    }


    // Increment lastEmpId to generate new emp_id
    const newEmpIdNumericPart = lastEmpId + 1;
    let newEmpId = `${empCode}-${newEmpIdNumericPart.toString().padStart(2, '0')}`; // Format the new emp_id

    // for Temporary employee entry
    if (dataToCreate.isEmpTemporary) {
      newEmpId = dataToCreate.emp_id;
    }

    let empJoining = {
      "emp_id": newEmpId, // Use the new emp_id
      "join_date": dataToCreate.joining_date,
      "gaushala_id": req.user.gaushala_id,
      "leave_date": "NA",
      "remark": "NA",
      "isActive": true
    };

    const checkEmpId = await dbService.findOne(Employee, { emp_id: newEmpId, gaushala_id: req.user.gaushala_id });

    if (checkEmpId) {
      return res.alreadyExist({ data: "Employee Already Exists" });
    }

    dataToCreate.gaushala_id = req.user.gaushala_id;
    dataToCreate.emp_id = newEmpId; // Assign the new emp_id to dataToCreate

    dataToCreate = new Employee(dataToCreate);
    empJoining = new emp_joining(empJoining);

    // Save both the employee and emp_joining records
    await Promise.all([dataToCreate.save(), empJoining.save()]);

    return res.success({ data: dataToCreate });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};


/**
 * @description : create multiple documents of Employee in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created Employees. {status, message, data}
 */
const bulkInsertEmployee = async (req, res) => {
  try {
    if (req.body && (!Array.isArray(req.body.data) || req.body.data.length < 1)) {
      return res.badRequest();
    }
    let dataToCreate = [...req.body.data];
    for (let i = 0; i < dataToCreate.length; i++) {
      dataToCreate[i].gaushala_id = req.user.gaushala_id
    }
    let createdEmployees = await dbService.create(Employee, dataToCreate);
    createdEmployees = { count: createdEmployees ? createdEmployees.length : 0 };
    return res.success({ data: { count: createdEmployees.count || 0 } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find all documents of Employee from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Employee(s). {status, message, data}
 */
const findAllEmployee = async (req, res) => {
  try {
    const reqBody = {
      "query": {
      },
      "options": {
        "select": [
          "emp_id",
          "payroll_name",
          "isActive"
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

    // const fieldToAdd = { gaushala_id: '01' }; // Replace with the desired gaushala_id value

    // // // Update all documents in the collection
    // report.updateMany({}, { $set: fieldToAdd }, (updateErr, result) => {
    //   if (updateErr) {
    //   } else {
    //   }
    // });

    let options = reqBody.options;
    let query = reqBody.query;
    query.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      employeeSchemaKey.findFilterKeys,
      Employee.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
    if (req.body.isCountOnly) {
      let totalRecords = await dbService.count(Employee, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundEmployees = await dbService.paginate(Employee, query, options);
    if (!foundEmployees || !foundEmployees.data || !foundEmployees.data.length) {
      return res.recordNotFound();
    }
    return res.success({ data: foundEmployees });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find document of Employee from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Employee. {status, message, data}
 */
const getEmployee = async (req, res) => {
  try {
    let query = {};
    query.gaushala_id = req.user.gaushala_id;
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message: 'invalid objectId.' });
    }
    query._id = req.params.id;
    let options = {};
    let foundEmployee = await dbService.findOne(Employee, query, options);
    if (!foundEmployee) {
      return res.recordNotFound();
    }
    return res.success({ data: foundEmployee });
  }
  catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : returns total number of documents of Employee.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getEmployeeCount = async (req, res) => {
  try {
    let where = {};
    where.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      employeeSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedEmployee = await dbService.count(Employee, where);
    return res.success({ data: { count: countedEmployee } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update document of Employee with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Employee.
 * @return {Object} : updated Employee. {status, message, data}
 */
const updateEmployee = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      employeeSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedEmployee = await dbService.updateOne(Employee, query, dataToUpdate);
    if (!updatedEmployee) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedEmployee });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : partially update document of Employee with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated Employee.
 * @return {obj} : updated Employee. {status, message, data}
 */
const partialUpdateEmployee = async (req, res) => {
  try {
    if (!req.params.id) {
      res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      employeeSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedEmployee = await dbService.updateOne(Employee, query, dataToUpdate);
    if (!updatedEmployee) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedEmployee });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const updateEmployeeSalary = async (req, res) => {
  try {
    const dataToUpdate = { ...req.body };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      employeeSchemaKey.salaryUpdateSchemaKeys
    );

    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }

    const findEmployee = await dbService.findOne(employee, { emp_id: dataToUpdate.emp_id, gaushala_id: req.user.gaushala_id });

    if (!findEmployee) {
      return res.recordNotFound({ message: `Employee not found ${dataToUpdate.emp_id}` });
    }

    // Add the new salary entry to the salary array
    const newSalaryEntry = {
      date: dataToUpdate.date,
      amountDecided: dataToUpdate.amountDecided
    };

    findEmployee.salary.push(newSalaryEntry);

    // Update the employee document in the database
    const updatedEmployee = await dbService.updateOne(employee,
      { emp_id: dataToUpdate.emp_id, gaushala_id: req.user.gaushala_id },
      { $set: { salary: findEmployee.salary } }
    );

    return res.success({ message: 'Salary updated successfully', data: updatedEmployee });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const updateEmpDod = async (req, res) => {
  try {
    const errorTags = [];
    const successTags = [];

    const allEmployees = await Employee.find();

    allEmployees.forEach(async function (doc) {
      var originalDate = doc.join_date;
      console.log(originalDate)
      var parts = originalDate.split(/[/\-]/);

      if (parts.length >= 3) {
        var year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
        var month = parts[1].padStart(2, '0');
        var day = parts[0].padStart(2, '0');

        var newDate = year + '-' + month + '-' + day;

        await Employee.updateOne(
          { _id: doc._id },
          { $set: { join_date: newDate } }
        );

        console.log({ emp_id: doc.emp_id, originalDate, newDate })

        successTags.push({ emp_id: doc.emp_id, originalDate, newDate })
      }
    });


    return res.success({ data: { errorTags, successTags } })

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const updateEmpID = async (req, res) => {
  try {

    const errorTags = [];
    const successTags = [];

    const emp_ids = await dbService.findMany(emp_attendance, { gaushala_id: '01' }, { emp_id: 1, _id: 0 });


    for (var emp_id of emp_ids) {

      const inputString = emp_id.emp_id;

      // Validate the input string
      const pattern = /^([A-Za-z]{3})(\d+)$/;
      const match = inputString.match(pattern);
      // const match = inputString.split(' ');
      // console.log(inputString, match, transformedString)

      if (match) {
        const transformedString = `${match[0]}-${match[1]}`;
        const findEmployeeJoining = await dbService.findOne(emp_joining, { emp_id: inputString });

        if (!findEmployeeJoining) {

          errorTags.push(inputString);

        } else {

          await dbService.updateMany(emp_attendance, { emp_id: inputString }, { $set: { emp_id: transformedString } });
          await dbService.updateOne(emp_joining, { emp_id: inputString }, { $set: { emp_id: transformedString } });

          successTags.push(`${transformedString} => ${inputString}`);
        }
      } else {
        errorTags.push(inputString);
      }
    }



    return res.success({ data: { errorTags, successTags, emp_ids } })


  } catch (error) {
    console.log(error)
  }
}

// const getMonthlyAttendance = async (req, res) => {
//   try {

//     let query = {};
//     query.gaushala_id = '01';

//     const reqYear = req.body.reqYear;
//     const reqMonth = req.body.reqMonth;

//     query.date = {
//       $regex: `^${reqYear}-${reqMonth}-\\d{2}`, // Matches '2023-10-XX' format
//     };

//     const pipeline = [
//       { $match: query },
//       {
//         $group: {
//           _id: "$emp_id",
//           presentDays: {
//             $sum: {
//               $cond: [{ $eq: ["$attendanceType", "Present"] }, 1, 0]
//             }
//           },
//           absentDays: {
//             $sum: {
//               $cond: [{ $eq: ["$attendanceType", "Absent"] }, 1, 0]
//             }
//           }
//         }
//       }
//     ];

//     const result = await emp_attendance.aggregate(pipeline);
//     return res.success({ data: result });

//   } catch (error) {
//     return res.internalServerError({ message: error.message })
//   }
// }

const getMonthlyAttendance = async (req, res) => {
  try {
    let query = {};
    query.gaushala_id = req.user.gaushala_id;

    const reqYear = req.body.reqYear;
    const reqMonth = String(req.body.reqMonth).padStart(2, '0'); // Ensure month is two digits

    query.date = {
      $regex: `^${reqYear}-${reqMonth}-\\d{2}` // Matches 'YYYY-MM-XX' format
    };
    const pipeline = [
      { $match: query },
      {
        $group: {
          _id: "$date",
          present: {
            $push: {
              $cond: [{ $eq: ["$attendanceType", "Present"] }, "$emp_id", null]
            }
          },
          absent: {
            $push: {
              $cond: [{ $eq: ["$attendanceType", "Absent"] }, "$emp_id", null]
            }
          }
        }
      },
      {
        $project: {
          date: "$_id",
          present: {
            $filter: {
              input: "$present",
              as: "emp_id",
              cond: { $ne: ["$$emp_id", null] }
            }
          },
          absent: {
            $filter: {
              input: "$absent",
              as: "emp_id",
              cond: { $ne: ["$$emp_id", null] }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          date: 1,

          present: "$present",
          absent: "$absent"

        }
      },
      {
        $sort: { date: 1 } // optional: sort by date
      }
    ];

    const result = await emp_attendance.aggregate(pipeline);
    return res.success({ data: result });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
}


module.exports = {
  updateEmpDod,
  updateEmployeeSalary,
  addEmployee,
  bulkInsertEmployee,
  findAllEmployee,
  getEmployee,
  getEmployeeCount,
  updateEmployee,
  partialUpdateEmployee,
  updateEmpID,
  getMonthlyAttendance
};