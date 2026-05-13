/**
 * salary_transactionController.js
 * @description : exports action methods for salary_transaction.
 */

const Salary_transaction = require('../../../model/salary_transaction');
const salary_transactionSchemaKey = require('../../../utils/validation/salary_transactionValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const { PAYMENT_TYPE } = require('../../../constants/authConstant');
const utils = require('../../../utils/common');
const emp_attendance = require('../../../model/emp_attendance');
const Employee = require('../../../model/employee');
const emp_joining = require('../../../model/emp_joining');
const cron = require('node-cron');

/**
 * @description : create document of Salary_transaction in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Salary_transaction. {status, message, data}
 */
const addSalary_transaction = async (req, res) => {
    try {
        let dataToCreate = { ...req.body || {} };
        let validateRequest = validation.validateParamsWithJoi(
            dataToCreate,
            salary_transactionSchemaKey.schemaKeys);
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }

        const salary_month = req.body.salary_month;
        const gaushala_id = req.user.gaushala_id;
        const emp_id = req.body.emp_id;

        const findSalaryTransaction = await dbService.findOne(Salary_transaction, { emp_id: emp_id, salary_month: salary_month, isDeleted: false });

        if (findSalaryTransaction) {
            return res.success({ message: `Salary already generated for ${salary_month}`, data: findSalaryTransaction });
        }

        const getWorkingDaysData = await getWorkingDays(salary_month, gaushala_id, emp_id);
        const getSalaryData = await getSalaryInfo(emp_id, getWorkingDaysData);

        dataToCreate = {
            emp_id: emp_id,
            gaushala_id: gaushala_id,
            salary_month: salary_month,
            total_working_days: getWorkingDaysData.totalDaysInMonth,
            actual_working_days: getWorkingDaysData.workingDays,
            leaves: getWorkingDaysData.absentCount,
            decided_salary: getSalaryData.currentSalary,
            payable_salary: getSalaryData.payable_salary,
            generated_date: req.body.generated_date,
            generatedBy: req.user.user_id,
            actual_pay_date: req.body.actual_pay_date,
            payment_type: PAYMENT_TYPE.CASH,
            pay_transaction_id: req.body.pay_transaction_id,
            isPaid: req.body.isPaid,
        }

        dataToCreate = new Salary_transaction(dataToCreate);
        let createdSalary_transaction = await dbService.create(Salary_transaction, dataToCreate);
        return res.success({ data: createdSalary_transaction });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};


async function getWorkingDays(salary_month, gaushala_id, emp_id) {
    try {
        const dateParts = salary_month.split('-');
        const salaryYear = dateParts[0];
        const salaryMonth = dateParts[1];

        const getStartEndDateOfMonth = utils.getFirstAndLastDateOfMonth(salaryYear, salaryMonth);

        const matchStage = {
            date: {
                $gte: `${getStartEndDateOfMonth.startDate}`,
                $lte: `${getStartEndDateOfMonth.endDate}`
            },
            gaushala_id: gaushala_id,
            emp_id: emp_id
        };

        const result = await emp_attendance.aggregate([
            {
                $match: matchStage,
            },
            {
                $group: {
                    _id: "$attendanceType",
                    count: { $sum: 1 }
                }
            }
        ]);

        const joiningData = await dbService.findAll(emp_joining, { emp_id: emp_id, gaushala_id: gaushala_id, isDeleted: false, isActive: true });
        if (!joiningData) {
            return `Unxpected Erro joing data not found for user ${emp_id}`;
        }

        const joiningDate = joiningData[joiningData.length - 1].join_date;

        const daysDifference = utils.getDaysDifference(joiningDate, getStartEndDateOfMonth.startDate, getStartEndDateOfMonth.endDate);

        // Calculate total working days in the month
        let totalDaysInMonth = utils.getDaysInMonth(getStartEndDateOfMonth.startDate);

        totalDaysInMonth = daysDifference == null ? totalDaysInMonth : daysDifference;

        // Initialize counts with 0
        let presentCount = 0;
        let absentCount = 0;

        // Update counts based on the result
        result.forEach(item => {
            if (item._id === "Present") {
                presentCount = item.count;
            } else if (item._id === "Absent") {
                absentCount = item.count;
            }
        });

        // Calculate working days by subtracting absent days from total days
        const workingDays = totalDaysInMonth - absentCount;

        return {
            totalDaysInMonth: totalDaysInMonth !== null ? totalDaysInMonth : 0,
            presentCount: presentCount !== null ? presentCount : 0,
            absentCount: absentCount !== null ? absentCount : 0,
            workingDays: workingDays !== null ? workingDays : 0,
            monthStartDate: getStartEndDateOfMonth.startDate
        };
    } catch (error) {
        console.log(error.message);
    }

}

async function getSalaryInfo(emp_id, getWorkingDaysData) {
    try {

        const foundEmp = await dbService.findOne(Employee, { emp_id: emp_id });
        if (!foundEmp) {
            console.log(`Employee not found ${emp_id}`)
            return `Employee not found ${emp_id}`;
        }

        const empSalary = foundEmp.salary;
        let currentSalary = 0;

        if (Array.isArray(empSalary) && empSalary.length > 0) {
            // Sort the salary array based on the "date" field in descending order
            empSalary.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Pick the first element after sorting (which will have the latest date)
            const latestSalary = empSalary[0];

            currentSalary = latestSalary.amountDecided;

            // Use latestSalary as needed
        }


        console.log("monthStartDate", getWorkingDaysData.monthStartDate)
        let totalDaysInMonth = utils.getDaysInMonth(getWorkingDaysData.monthStartDate);
        console.log("totalDaysInMonth", totalDaysInMonth)
        // count salary 
        const salaryPerDay = currentSalary / totalDaysInMonth;

        console.log("salaryPerDay", salaryPerDay)

        // Handle NaN and ensure leaveCount is a number
        const leaveCount = foundEmp.gender === "FEMALE"
            ? Math.max(0, getWorkingDaysData.absentCount - 3)
            : Math.max(0, getWorkingDaysData.absentCount - 2);

        console.log("leaveCount", leaveCount)

        const workingDaysAfterLeaveCut = getWorkingDaysData.totalDaysInMonth - leaveCount

        const payable_salary = salaryPerDay * workingDaysAfterLeaveCut

        return {
            currentSalary,
            payable_salary,
            salaryPerDay
        }


    } catch (error) {
        console.log(error.message);
    }
}

/**
 * @description : create multiple documents of Salary_transaction in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created Salary_transactions. {status, message, data}
 */
const bulkInsertSalary_transaction = async (req, res) => {
    try {
        if (req.body && (!Array.isArray(req.body.data) || req.body.data.length < 1)) {
            return res.badRequest();
        }
        let dataToCreate = [...req.body.data];
        let createdSalary_transactions = await dbService.create(Salary_transaction, dataToCreate);
        createdSalary_transactions = { count: createdSalary_transactions ? createdSalary_transactions.length : 0 };
        return res.success({ data: { count: createdSalary_transactions.count || 0 } });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : find all documents of Salary_transaction from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Salary_transaction(s). {status, message, data}
 */
const findAllSalary_transaction = async (req, res) => {
    try {
        let query = {};

        let validateRequest = validation.validateFilterWithJoi(
            req.body,
            salary_transactionSchemaKey.findMonthWiseFilterKeys,
            Salary_transaction.schema.obj
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `${validateRequest.message}` });
        }

        const salary_month = req.body.salary_month;
        query = {
            salary_month: salary_month,
            gaushala_id: req.user.gaushala_id,
        };

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
                    "salary_month": 1,
                    "total_working_days": 1,
                    "actual_working_days": 1,
                    "leaves": 1,
                    "decided_salary": 1,
                    "payable_salary": 1,
                    "generated_date": 1,
                    "generatedBy": 1,
                    "actual_pay_date": 1,
                    "payment_type": 1,
                    "pay_transaction_id": 1,
                    "isPaid": 1,
                    "payroll_name": "$employeeData.payroll_name", // Include employee's payroll_name
                    "gender": "$employeeData.gender"
                }
            }
        ];

        const foundSalary_transactions = await Salary_transaction.aggregate(pipeline);

        if (!foundSalary_transactions || foundSalary_transactions.length == 0) {
            return res.recordNotFound();
        }

        return res.success({ data: foundSalary_transactions });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : update document of Salary_transaction with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Salary_transaction.
 * @return {Object} : updated Salary_transaction. {status, message, data}
 */
const updateSalary_transaction = async (req, res) => {
    try {
        let dataToUpdate = { ...req.body, };
        let validateRequest = validation.validateParamsWithJoi(
            dataToUpdate,
            salary_transactionSchemaKey.updateSchemaKeys
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }
        const query = { _id: req.params.id, gaushala_id: req.user.gaushala_id };
        let updatedSalary_transaction = await dbService.updateOne(Salary_transaction, query, dataToUpdate);
        if (!updatedSalary_transaction) {
            return res.recordNotFound();
        }
        return res.success({ data: updatedSalary_transaction });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : partially update document of Salary_transaction with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated Salary_transaction.
 * @return {obj} : updated Salary_transaction. {status, message, data}
 */
const partialUpdateSalary_transaction = async (req, res) => {
    try {
        if (!req.params.id) {
            res.badRequest({ message: 'Insufficient request parameters! id is required.' });
        }
        let dataToUpdate = { ...req.body, };
        let validateRequest = validation.validateParamsWithJoi(
            dataToUpdate,
            salary_transactionSchemaKey.updateSchemaKeys
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }
        const query = { _id: req.params.id };
        let updatedSalary_transaction = await dbService.updateOne(Salary_transaction, query, dataToUpdate);
        if (!updatedSalary_transaction) {
            return res.recordNotFound();
        }
        return res.success({ data: updatedSalary_transaction });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};
/**
 * @description : deactivate document of Salary_transaction from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Salary_transaction.
 * @return {Object} : deactivated Salary_transaction. {status, message, data}
 */
const softDeleteSalary_transaction = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
        }
        let query = { _id: req.params.id };
        const updateBody = { isDeleted: true, };
        let updatedSalary_transaction = await dbService.updateOne(Salary_transaction, query, updateBody);
        if (!updatedSalary_transaction) {
            return res.recordNotFound();
        }
        return res.success({ data: updatedSalary_transaction });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

const cronForSalary = async (req, res) => {
    try {

        /**
 * Benglore gaushala id = "01"
 * kolkata gaushala id = "02"
 */

        // const gaushala_list = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
        const gaushala_list = ["01"];
        for (let i = 0; i < gaushala_list.length; i++) {
            let gaushala_id = gaushala_list[i];
            console.log("Entered in cronForSalary");

            await salaryDataSource(gaushala_id);

        }

        // return res.success({ data: 'Salary created' });

    } catch (error) {
        console.log(error.message);
    }
}

async function salaryDataSource(gaushala_id) {
    try {

        console.log("Entered in salaryDataSource");

        const allEmployees = await dbService.findMany(Employee, { gaushala_id: gaushala_id, isActive: true, isDeleted: false });



        if (!allEmployees) {
            console.log(`No employee find for gaushala ${gaushala_id}`);
            return `No employee find for gaushala ${gaushala_id}`;
        }

        for (var employee of allEmployees) {

            try {
                await generateSalaryFromCron(employee);
            } catch (error) {
                console.log("salaryDataSource 0.1", error.message);
            }

        }


    } catch (error) {
        console.log("salaryDataSource", error.message);
    }
}

async function generateSalaryFromCron(employee) {
    try {
        console.log("employee", employee.emp_id);

        const dateParts = utils.getTodayDate().split('-');
        const salary_month = `${dateParts[0]}-${dateParts[1]}`;
        //const salary_month = "2024-01";

        const checkSalaryAlreadyGenerated = await dbService.findOne(Salary_transaction, { emp_id: employee.emp_id, salary_month: salary_month, isDeleted: false });

        const gaushala_id = employee.gaushala_id;
        const emp_id = employee.emp_id;
        const getWorkingDaysData = await getWorkingDays(salary_month, gaushala_id, emp_id);
        const getSalaryData = await getSalaryInfo(emp_id, getWorkingDaysData);

        if (!checkSalaryAlreadyGenerated) {
            console.log("salary_month", salary_month)

            let dataToCreate = {
                emp_id: emp_id,
                gaushala_id: gaushala_id,
                salary_month: salary_month,
                total_working_days: getWorkingDaysData.totalDaysInMonth,
                actual_working_days: getWorkingDaysData.workingDays,
                leaves: getWorkingDaysData.absentCount,
                decided_salary: getSalaryData.currentSalary,
                payable_salary: getSalaryData.payable_salary,
                generated_date: utils.getTodayDate(),
                generatedBy: "Auto Generate",
                payment_type: PAYMENT_TYPE.CASH,
                pay_transaction_id: "",
            }
            dataToCreate = new Salary_transaction(dataToCreate);
            await dbService.create(Salary_transaction, dataToCreate);

        } else {

            const dataToUpdate = {
                total_working_days: getWorkingDaysData.totalDaysInMonth,
                actual_working_days: getWorkingDaysData.workingDays,
                leaves: getWorkingDaysData.absentCount,
                decided_salary: getSalaryData.currentSalary,
                payable_salary: getSalaryData.payable_salary,
            };
            await dbService.updateOne(Salary_transaction, { emp_id: emp_id, salary_month: salary_month }, dataToUpdate);

        }

    } catch (error) {
        console.log("generateSalaryFromCron error: ", error.message);
    }
}

module.exports = {
    cronForSalary,
    addSalary_transaction,
    bulkInsertSalary_transaction,
    findAllSalary_transaction,
    updateSalary_transaction,
    partialUpdateSalary_transaction,
    softDeleteSalary_transaction
};