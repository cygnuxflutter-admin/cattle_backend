/**
 * medical_logController.js
 * @description : exports action methods for medical_log.
 */

const Medical_log = require('../../../model/medical_log');
const medical_logSchemaKey = require('../../../utils/validation/medical_logValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/common');

/**
 * @description : create document of Medical_log in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Medical_log. {status, message, data}
 */
const addMedical_log = async (req, res) => {
    try {
        let dataToCreate = { ...req.body || {} };
        let validateRequest = validation.validateParamsWithJoi(
            dataToCreate,
            medical_logSchemaKey.schemaKeys);
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }
        dataToCreate.gaushala_id = req.user.gaushala_id

        dataToCreate = new Medical_log(dataToCreate);
        let createdMedical_log = await dbService.create(Medical_log, dataToCreate);
        return res.success({ data: createdMedical_log });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : create multiple documents of Medical_log in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created Medical_logs. {status, message, data}
 */
const bulkInsertMedical_log = async (req, res) => {
    try {
        if (req.body && (!Array.isArray(req.body.data) || req.body.data.length < 1)) {
            return res.badRequest();
        }
        let dataToCreate = [...req.body.data];
        for (let i = 0; i < dataToCreate.length; i++) {
            dataToCreate[i].gaushala_id = req.user.gaushala_id
        }
        let createdMedical_logs = await dbService.create(Medical_log, dataToCreate);
        createdMedical_logs = { count: createdMedical_logs ? createdMedical_logs.length : 0 };
        return res.success({ data: { count: createdMedical_logs.count || 0 } });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : find all documents of Medical_log from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Medical_log(s). {status, message, data}
 */
const findAllMedical_log = async (req, res) => {
    try {
        let options = {};
        let query = {};
        query.gaushala_id = req.user.gaushala_id;
        let validateRequest = validation.validateFilterWithJoi(
            req.body,
            medical_logSchemaKey.findFilterKeys,
            Medical_log.schema.obj
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `${validateRequest.message}` });
        }
        if (typeof req.body.query === 'object' && req.body.query !== null) {
            query = { ...req.body.query };
        }
        if (req.body.isCountOnly) {
            let totalRecords = await dbService.count(Medical_log, query);
            return res.success({ data: { totalRecords } });
        }
        if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
            options = { ...req.body.options };
        }
        let foundMedical_logs = await dbService.paginate(Medical_log, query, options);
        if (!foundMedical_logs || !foundMedical_logs.data || !foundMedical_logs.data.length) {
            return res.recordNotFound();
        }
        return res.success({ data: foundMedical_logs });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : find document of Medical_log from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Medical_log. {status, message, data}
 */
const getMedical_log = async (req, res) => {
    try {
        let query = {};
        query.gaushala_id = req.user.gaushala_id;
        if (!ObjectId.isValid(req.params.id)) {
            return res.validationError({ message: 'invalid objectId.' });
        }
        query._id = req.params.id;
        let options = {};
        let foundMedical_log = await dbService.findOne(Medical_log, query, options);
        if (!foundMedical_log) {
            return res.recordNotFound();
        }
        return res.success({ data: foundMedical_log });
    }
    catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : returns total number of documents of Medical_log.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getMedical_logCount = async (req, res) => {
    try {
        let where = {};
        where.gaushala_id = req.user.gaushala_id;
        let validateRequest = validation.validateFilterWithJoi(
            req.body,
            medical_logSchemaKey.findFilterKeys,
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `${validateRequest.message}` });
        }
        if (typeof req.body.where === 'object' && req.body.where !== null) {
            where = { ...req.body.where };
        }
        let countedMedical_log = await dbService.count(Medical_log, where);
        return res.success({ data: { count: countedMedical_log } });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : update document of Medical_log with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Medical_log.
 * @return {Object} : updated Medical_log. {status, message, data}
 */
const updateMedical_log = async (req, res) => {
    try {
        let dataToUpdate = { ...req.body, };
        let validateRequest = validation.validateParamsWithJoi(
            dataToUpdate,
            medical_logSchemaKey.updateSchemaKeys
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }
        let query = { _id: req.params.id };
        query.gaushala_id = req.user.gaushala_id;
        let updatedMedical_log = await dbService.updateOne(Medical_log, query, dataToUpdate);
        if (!updatedMedical_log) {
            return res.recordNotFound();
        }
        return res.success({ data: updatedMedical_log });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : update multiple records of Medical_log with data by filter.
 * @param {Object} req : request including filter and data in request body.
 * @param {Object} res : response of updated Medical_logs.
 * @return {Object} : updated Medical_logs. {status, message, data}
 */
const bulkUpdateMedical_log = async (req, res) => {
    try {
        let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
        filter.gaushala_id = req.user.gaushala_id;
        let dataToUpdate = {};
        if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
            dataToUpdate = { ...req.body.data, };
        }
        let updatedMedical_log = await dbService.updateMany(Medical_log, filter, dataToUpdate);
        if (!updatedMedical_log) {
            return res.recordNotFound();
        }
        return res.success({ data: { count: updatedMedical_log } });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : partially update document of Medical_log with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated Medical_log.
 * @return {obj} : updated Medical_log. {status, message, data}
 */
const partialUpdateMedical_log = async (req, res) => {
    try {
        if (!req.params.id) {
            res.badRequest({ message: 'Insufficient request parameters! id is required.' });
        }
        let dataToUpdate = { ...req.body, };
        let validateRequest = validation.validateParamsWithJoi(
            dataToUpdate,
            medical_logSchemaKey.updateSchemaKeys
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }
        let query = { _id: req.params.id };
        query.gaushala_id = req.user.gaushala_id;
        let updatedMedical_log = await dbService.updateOne(Medical_log, query, dataToUpdate);
        if (!updatedMedical_log) {
            return res.recordNotFound();
        }
        return res.success({ data: updatedMedical_log });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};
/**
 * @description : deactivate document of Medical_log from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Medical_log.
 * @return {Object} : deactivated Medical_log. {status, message, data}
 */
const softDeleteMedical_log = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
        }
        let query = { _id: req.params.id };
        query.gaushala_id = req.user.gaushala_id;
        const updateBody = { isDeleted: true, };
        let updatedMedical_log = await dbService.updateOne(Medical_log, query, updateBody);
        if (!updatedMedical_log) {
            return res.recordNotFound();
        }
        return res.success({ data: updatedMedical_log });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : delete document of Medical_log from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted Medical_log. {status, message, data}
 */
const deleteMedical_log = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
        }
        let query = { _id: req.params.id };
        query.gaushala_id = req.user.gaushala_id;
        const deletedMedical_log = await dbService.deleteOne(Medical_log, query);
        if (!deletedMedical_log) {
            return res.recordNotFound();
        }
        return res.success({ data: deletedMedical_log });

    }
    catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : delete documents of Medical_log in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of documents deleted.
 * @return {Object} : no of documents deleted. {status, message, data}
 */
const deleteManyMedical_log = async (req, res) => {
    try {
        let ids = req.body.ids;
        if (!ids || !Array.isArray(ids) || ids.length < 1) {
            return res.badRequest();
        }
        let query = { _id: { $in: ids } };
        query.gaushala_id = req.user.gaushala_id;
        const deletedMedical_log = await dbService.deleteMany(Medical_log, query);
        if (!deletedMedical_log) {
            return res.recordNotFound();
        }
        return res.success({ data: { count: deletedMedical_log } });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};
/**
 * @description : deactivate multiple documents of Medical_log from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated documents of Medical_log.
 * @return {Object} : number of deactivated documents of Medical_log. {status, message, data}
 */
const softDeleteManyMedical_log = async (req, res) => {
    try {
        let ids = req.body.ids;
        if (!ids || !Array.isArray(ids) || ids.length < 1) {
            return res.badRequest();
        }
        let query = { _id: { $in: ids } };
        query.gaushala_id = req.user.gaushala_id;
        const updateBody = { isDeleted: true, };
        let updatedMedical_log = await dbService.updateMany(Medical_log, query, updateBody);
        if (!updatedMedical_log) {
            return res.recordNotFound();
        }
        return res.success({ data: { count: updatedMedical_log } });

    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

// get medical logs medicine vise 
const getMedicalLogByVacc = async (req, res) => {

    try {
        let query = {};

    } catch (error) {

    }

};

module.exports = {
    addMedical_log,
    bulkInsertMedical_log,
    findAllMedical_log,
    getMedical_log,
    getMedical_logCount,
    updateMedical_log,
    bulkUpdateMedical_log,
    partialUpdateMedical_log,
    softDeleteMedical_log,
    deleteMedical_log,
    deleteManyMedical_log,
    softDeleteManyMedical_log
};