/**
 * medical_reminderController.js
 * @description : exports action methods for medical_reminder.
 */

const Medical_reminder = require('../../../model/medical_reminder');
const COW = require('../../../model/COW');
const medical_reminderSchemaKey = require('../../../utils/validation/medical_reminderValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/common');

/**
 * Helper to calculate age in months from a date of birth string (YYYY-MM-DD)
 */
function getAgeInMonths(dobString) {
    if (!dobString) return 0;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return 0;
    const today = new Date();
    let months = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
    if (today.getDate() < dob.getDate()) {
        months--;
    }
    return months >= 0 ? months : 0;
}

/**
 * Helper to add months to a YYYY-MM-DD date string
 */
function addMonthsToDate(dateString, months) {
    const date = new Date(dateString);
    date.setMonth(date.getMonth() + months);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Helper to find the latest log based on the date field
 */
function getLatestLog(logsArray) {
    if (!logsArray || !logsArray.length) return null;
    return logsArray.reduce((latest, current) => {
        return new Date(current.date) > new Date(latest.date) ? current : latest;
    });
}

/**
 * @description : find all cows with pending/due medical reminders based on DOB and vaccination history.
 * @param {Object} req : request including option and query filters.
 * @param {Object} res : response containing data of cows and their pending vaccines.
 * @return {Object} : list of cows with pending reminders.
 */
const getPendingReminders = async (req, res) => {
    try {
        const gaushala_id = req.user.gaushala_id;

        // Build base query for active/alive cows
        let cowQuery = {
            gaushala_id: gaushala_id,
            isDeleted: { $ne: true },
            $or: [
                { send_died_date: { $exists: false } },
                { send_died_date: null },
                { send_died_date: '' },
                { send_died_date: 'NA' }
            ]
        };

        // Apply exact match query filters at the database level
        if (req.body && req.body.query && typeof req.body.query === 'object') {
            const { tag_id, type } = req.body.query;
            if (tag_id) {
                cowQuery.tag_id = tag_id;
            }
            if (type) {
                cowQuery.type = type;
            }
        }

        // Find active/alive cows matching the criteria
        const activeCows = await COW.find(cowQuery);

        if (!activeCows || !activeCows.length) {
            return res.success({ data: { data: [], paginator: { itemCount: 0, perPage: 2000, currentPage: 1, pageCount: 1 } } });
        }

        const cowIds = activeCows.map(c => c._id);

        // Fetch all vaccination logs for these cows
        const logs = await Medical_reminder.find({
            cow_id: { $in: cowIds },
            isDeleted: { $ne: true }
        });

        // Group logs by cow ID and vaccine name
        const logsByCowAndVaccine = {};
        logs.forEach(log => {
            if (!log.cow_id) return;
            const cowIdStr = log.cow_id.toString();
            if (!logsByCowAndVaccine[cowIdStr]) {
                logsByCowAndVaccine[cowIdStr] = {};
            }
            if (!logsByCowAndVaccine[cowIdStr][log.vaccine_name]) {
                logsByCowAndVaccine[cowIdStr][log.vaccine_name] = [];
            }
            logsByCowAndVaccine[cowIdStr][log.vaccine_name].push(log);
        });

        const todayStr = utils.getTodayDate();
        const pendingCowsList = [];

        for (const cow of activeCows) {
            const cowIdStr = cow._id.toString();
            const dob = cow.dob;
            if (!dob || dob === '') continue;

            const ageInMonths = getAgeInMonths(dob);
            const pendingVaccines = [];
            const cowLogs = logsByCowAndVaccine[cowIdStr] || {};

            // 1. Deworming: Due at >= 6 months, one-time
            const dewormingLogs = cowLogs['deworming'] || [];
            if (dewormingLogs.length === 0) {
                if (ageInMonths >= 6) {
                    pendingVaccines.push({
                        vaccineName: 'deworming',
                        dueDate: addMonthsToDate(dob, 6),
                        lastGivenDate: null,
                        status: 'Due'
                    });
                }
            }

            // 2. Brucellosis: Female only, due at >= 4 months, one-time
            if (cow.isFemale === true) {
                const brucellosisLogs = cowLogs['brucellosis'] || [];
                if (brucellosisLogs.length === 0) {
                    if (ageInMonths >= 4) {
                        pendingVaccines.push({
                            vaccineName: 'brucellosis',
                            dueDate: addMonthsToDate(dob, 4),
                            lastGivenDate: null,
                            status: 'Due'
                        });
                    }
                }
            }

            // 3 & 4. LSD and FMD: First dose at >= 3 months, recurring every 6 months
            const checkRecurringVaccine = (vaccineName) => {
                const vaccLogs = cowLogs[vaccineName] || [];
                if (vaccLogs.length === 0) {
                    if (ageInMonths >= 3) {
                        pendingVaccines.push({
                            vaccineName: vaccineName,
                            dueDate: addMonthsToDate(dob, 3),
                            lastGivenDate: null,
                            status: 'Due'
                        });
                    }
                } else {
                    const latestLog = getLatestLog(vaccLogs);
                    if (latestLog && latestLog.date) {
                        const nextDueDate = addMonthsToDate(latestLog.date, 6);
                        if (todayStr >= nextDueDate) {
                            pendingVaccines.push({
                                vaccineName: vaccineName,
                                dueDate: nextDueDate,
                                lastGivenDate: latestLog.date,
                                status: 'Due'
                            });
                        }
                    }
                }
            };

            checkRecurringVaccine('lsd');
            checkRecurringVaccine('fmd');

            // Gather complete vaccination history for this cow
            const vaccinationHistory = [];
            Object.keys(cowLogs).forEach(vaccineName => {
                const logsArray = cowLogs[vaccineName] || [];
                logsArray.forEach(log => {
                    vaccinationHistory.push({
                        id: log._id,
                        vaccine_name: log.vaccine_name,
                        date: log.date,
                        remark: log.remark || '',
                        addedBy: log.addedBy
                    });
                });
            });

            // Sort history by date descending (most recent first)
            vaccinationHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Return cow details with pending vaccines and history
            pendingCowsList.push({
                id: cow._id,
                tag_id: cow.tag_id,
                breed: cow.breed,
                type: cow.type,
                dob: cow.dob,
                isFemale: cow.isFemale,
                ageInMonths: ageInMonths,
                pendingVaccines: pendingVaccines,
                vaccinationHistory: vaccinationHistory
            });
        }

        // Memory filtering is now handled at the DB level for efficiency
        let filteredList = pendingCowsList;

        // Pagination setup
        let page = 1;
        let limit = 2000;
        let usePagination = true;

        if (req.body && req.body.options && typeof req.body.options === 'object') {
            if (req.body.options.page) page = parseInt(req.body.options.page) || 1;
            if (req.body.options.limit) limit = parseInt(req.body.options.limit) || 2000;
            if (req.body.options.pagination === false) usePagination = false;
        }

        const totalDocs = filteredList.length;
        let paginatedData = filteredList;

        if (usePagination) {
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            paginatedData = filteredList.slice(startIndex, endIndex);
        }

        const totalPages = usePagination ? Math.ceil(totalDocs / limit) : 1;

        return res.success({
            data: {
                data: paginatedData,
                paginator: {
                    itemCount: totalDocs,
                    perPage: limit,
                    currentPage: page,
                    pageCount: totalPages,
                    slNo: usePagination ? ((page - 1) * limit + 1) : 1,
                    hasPrevPage: page > 1,
                    hasNextPage: page < totalPages,
                    prev: page > 1 ? page - 1 : null,
                    next: page < totalPages ? page + 1 : null
                }
            }
        });

    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : create document of Medical_reminder in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Medical_reminder. {status, message, data}
 */
const addMedicalReminder = async (req, res) => {
    try {

        let dataToCreate = { ...req.body || {} };
        let validateRequest = validation.validateParamsWithJoi(
            dataToCreate,
            medical_reminderSchemaKey.schemaKeys
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }
        dataToCreate.gaushala_id = req.user.gaushala_id;
        dataToCreate.addedBy = req.user.user_id || req.user.id || '';

        dataToCreate = new Medical_reminder(dataToCreate);
        let createdReminder = await dbService.create(Medical_reminder, dataToCreate);
        return res.success({ data: createdReminder });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : find all documents of Medical_reminder from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Medical_reminder(s). {status, message, data}
 */
const findAllMedicalReminder = async (req, res) => {
    try {
        let options = {};
        let query = {};
        query.gaushala_id = req.user.gaushala_id;
        let validateRequest = validation.validateFilterWithJoi(
            req.body,
            medical_reminderSchemaKey.findFilterKeys,
            Medical_reminder.schema.obj
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `${validateRequest.message}` });
        }
        if (typeof req.body.query === 'object' && req.body.query !== null) {
            query = { ...req.body.query, gaushala_id: req.user.gaushala_id };
        }
        if (req.body.isCountOnly) {
            let totalRecords = await dbService.count(Medical_reminder, query);
            return res.success({ data: { totalRecords } });
        }
        if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
            options = { ...req.body.options };
        }
        let foundReminders = await dbService.paginate(Medical_reminder, query, options);
        if (!foundReminders || !foundReminders.data || !foundReminders.data.length) {
            return res.recordNotFound();
        }
        return res.success({ data: foundReminders });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : find document of Medical_reminder from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Medical_reminder. {status, message, data}
 */
const getMedicalReminder = async (req, res) => {
    try {
        let query = {};
        query.gaushala_id = req.user.gaushala_id;
        if (!ObjectId.isValid(req.params.id)) {
            return res.validationError({ message: 'invalid objectId.' });
        }
        query._id = req.params.id;
        let options = {};
        let foundReminder = await dbService.findOne(Medical_reminder, query, options);
        if (!foundReminder) {
            return res.recordNotFound();
        }
        return res.success({ data: foundReminder });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : update document of Medical_reminder with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Medical_reminder.
 * @return {Object} : updated Medical_reminder. {status, message, data}
 */
const updateMedicalReminder = async (req, res) => {
    try {
        let dataToUpdate = { ...req.body };
        let validateRequest = validation.validateParamsWithJoi(
            dataToUpdate,
            medical_reminderSchemaKey.updateSchemaKeys
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }
        let query = { _id: req.params.id };
        query.gaushala_id = req.user.gaushala_id;
        let updatedReminder = await dbService.updateOne(Medical_reminder, query, dataToUpdate);
        if (!updatedReminder) {
            return res.recordNotFound();
        }
        return res.success({ data: updatedReminder });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : partially update document of Medical_reminder with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated Medical_reminder.
 * @return {obj} : updated Medical_reminder. {status, message, data}
 */
const partialUpdateMedicalReminder = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
        }
        let dataToUpdate = { ...req.body };
        let validateRequest = validation.validateParamsWithJoi(
            dataToUpdate,
            medical_reminderSchemaKey.updateSchemaKeys
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }
        let query = { _id: req.params.id };
        query.gaushala_id = req.user.gaushala_id;
        let updatedReminder = await dbService.updateOne(Medical_reminder, query, dataToUpdate);
        if (!updatedReminder) {
            return res.recordNotFound();
        }
        return res.success({ data: updatedReminder });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : deactivate document of Medical_reminder from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Medical_reminder.
 * @return {Object} : deactivated Medical_reminder. {status, message, data}
 */
const softDeleteMedicalReminder = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
        }
        let query = { _id: req.params.id };
        query.gaushala_id = req.user.gaushala_id;
        const updateBody = { isDeleted: true };
        let updatedReminder = await dbService.updateOne(Medical_reminder, query, updateBody);
        if (!updatedReminder) {
            return res.recordNotFound();
        }
        return res.success({ data: updatedReminder });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : delete document of Medical_reminder from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted Medical_reminder. {status, message, data}
 */
const deleteMedicalReminder = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
        }
        let query = { _id: req.params.id };
        query.gaushala_id = req.user.gaushala_id;
        const deletedReminder = await dbService.deleteOne(Medical_reminder, query);
        if (!deletedReminder) {
            return res.recordNotFound();
        }
        return res.success({ data: deletedReminder });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

module.exports = {
    getPendingReminders,
    addMedicalReminder,
    findAllMedicalReminder,
    getMedicalReminder,
    updateMedicalReminder,
    partialUpdateMedicalReminder,
    softDeleteMedicalReminder,
    deleteMedicalReminder
};
