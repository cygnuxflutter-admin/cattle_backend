/**
 * visitorDetailsController.js
 * @description : exports action methods for visitorDetails.
 */

const VisitorDetails = require('../../../model/visitorDetails');
const visitorDetailsSchemaKey = require('../../../utils/validation/visitorDetailsValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/common');

/**
 * @description : create document of VisitorDetails in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created VisitorDetails. {status, message, data}
 */
const addVisitorDetails = async (req, res) => {
    try {
        let dataToCreate = { ...req.body || {} };
        let validateRequest = validation.validateParamsWithJoi(
            dataToCreate,
            visitorDetailsSchemaKey.schemaKeys);
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }
        // dataToCreate.addedBy = req.user.id;
        dataToCreate = new VisitorDetails(dataToCreate);
        let createdVisitorDetails = await dbService.create(VisitorDetails, dataToCreate);
        return res.success({ data: createdVisitorDetails });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : create multiple documents of VisitorDetails in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created VisitorDetailss. {status, message, data}
 */
const bulkInsertVisitorDetails = async (req, res) => {
    try {
        if (req.body && (!Array.isArray(req.body.data) || req.body.data.length < 1)) {
            return res.badRequest();
        }
        let dataToCreate = [...req.body.data];
        for (let i = 0; i < dataToCreate.length; i++) {
            dataToCreate[i] = {
                ...dataToCreate[i],
                addedBy: req.user.id
            };
        }
        let createdVisitorDetailss = await dbService.create(VisitorDetails, dataToCreate);
        createdVisitorDetailss = { count: createdVisitorDetailss ? createdVisitorDetailss.length : 0 };
        return res.success({ data: { count: createdVisitorDetailss.count || 0 } });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : find all documents of VisitorDetails from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found VisitorDetails(s). {status, message, data}
 */
const findAllVisitorDetails = async (req, res) => {
    try {
        let options = {};

        let query = {};
        query.gaushala_id = req.user.gaushala_id;

        if (req.body.startDate && req.body.endDate) {
            // Convert the date strings to Date objects
            const startDate = req.body.startDate;
            const endDate = req.body.endDate;

            // Add a date range condition to the query
            query.visitDate = {
                $gte: startDate,
                $lte: endDate,
            };
        }

        let foundVisitorDetailss = await dbService.findAll(VisitorDetails, query, options);
        if (!foundVisitorDetailss || !foundVisitorDetailss.length) {
            return res.recordNotFound();
        }
        return res.success({ data: foundVisitorDetailss });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : find document of VisitorDetails from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found VisitorDetails. {status, message, data}
 */
const getVisitorDetails = async (req, res) => {
    try {
        let query = {};
        if (!ObjectId.isValid(req.params.id)) {
            return res.validationError({ message: 'invalid objectId.' });
        }
        query._id = req.params.id;
        let options = {};
        let foundVisitorDetails = await dbService.findOne(VisitorDetails, query, options);
        if (!foundVisitorDetails) {
            return res.recordNotFound();
        }
        return res.success({ data: foundVisitorDetails });
    }
    catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : returns total number of documents of VisitorDetails.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getVisitorDetailsCount = async (req, res) => {
    try {
        let where = {};
        let validateRequest = validation.validateFilterWithJoi(
            req.body,
            visitorDetailsSchemaKey.findFilterKeys,
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `${validateRequest.message}` });
        }
        if (typeof req.body.where === 'object' && req.body.where !== null) {
            where = { ...req.body.where };
        }
        let countedVisitorDetails = await dbService.count(VisitorDetails, where);
        return res.success({ data: { count: countedVisitorDetails } });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : update document of VisitorDetails with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated VisitorDetails.
 * @return {Object} : updated VisitorDetails. {status, message, data}
 */
const updateVisitorDetails = async (req, res) => {
    try {
        let dataToUpdate = { ...req.body, };
        let validateRequest = validation.validateParamsWithJoi(
            dataToUpdate,
            visitorDetailsSchemaKey.updateSchemaKeys
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }
        const query = { _id: req.params.id };
        let updatedVisitorDetails = await dbService.updateOne(VisitorDetails, query, dataToUpdate);
        if (!updatedVisitorDetails) {
            return res.recordNotFound();
        }
        return res.success({ data: updatedVisitorDetails });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : update multiple records of VisitorDetails with data by filter.
 * @param {Object} req : request including filter and data in request body.
 * @param {Object} res : response of updated VisitorDetailss.
 * @return {Object} : updated VisitorDetailss. {status, message, data}
 */
const bulkUpdateVisitorDetails = async (req, res) => {
    try {
        let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
        let dataToUpdate = {};
        delete dataToUpdate['addedBy'];
        if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
            dataToUpdate = { ...req.body.data, };
        }
        let updatedVisitorDetails = await dbService.updateMany(VisitorDetails, filter, dataToUpdate);
        if (!updatedVisitorDetails) {
            return res.recordNotFound();
        }
        return res.success({ data: { count: updatedVisitorDetails } });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : partially update document of VisitorDetails with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated VisitorDetails.
 * @return {obj} : updated VisitorDetails. {status, message, data}
 */
const partialUpdateVisitorDetails = async (req, res) => {
    try {
        if (!req.params.id) {
            res.badRequest({ message: 'Insufficient request parameters! id is required.' });
        }
        delete req.body['addedBy'];
        let dataToUpdate = { ...req.body, };
        let validateRequest = validation.validateParamsWithJoi(
            dataToUpdate,
            visitorDetailsSchemaKey.updateSchemaKeys
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }
        const query = { _id: req.params.id };
        let updatedVisitorDetails = await dbService.updateOne(VisitorDetails, query, dataToUpdate);
        if (!updatedVisitorDetails) {
            return res.recordNotFound();
        }
        return res.success({ data: updatedVisitorDetails });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};
/**
 * @description : deactivate document of VisitorDetails from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of VisitorDetails.
 * @return {Object} : deactivated VisitorDetails. {status, message, data}
 */
const softDeleteVisitorDetails = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
        }
        let query = { _id: req.params.id };
        const updateBody = { isDeleted: true, };
        let updatedVisitorDetails = await dbService.updateOne(VisitorDetails, query, updateBody);
        if (!updatedVisitorDetails) {
            return res.recordNotFound();
        }
        return res.success({ data: updatedVisitorDetails });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : delete document of VisitorDetails from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted VisitorDetails. {status, message, data}
 */
const deleteVisitorDetails = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
        }
        const query = { _id: req.params.id };
        const deletedVisitorDetails = await dbService.deleteOne(VisitorDetails, query);
        if (!deletedVisitorDetails) {
            return res.recordNotFound();
        }
        return res.success({ data: deletedVisitorDetails });

    }
    catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : delete documents of VisitorDetails in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of documents deleted.
 * @return {Object} : no of documents deleted. {status, message, data}
 */
const deleteManyVisitorDetails = async (req, res) => {
    try {
        let ids = req.body.ids;
        if (!ids || !Array.isArray(ids) || ids.length < 1) {
            return res.badRequest();
        }
        const query = { _id: { $in: ids } };
        const deletedVisitorDetails = await dbService.deleteMany(VisitorDetails, query);
        if (!deletedVisitorDetails) {
            return res.recordNotFound();
        }
        return res.success({ data: { count: deletedVisitorDetails } });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};
/**
 * @description : deactivate multiple documents of VisitorDetails from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated documents of VisitorDetails.
 * @return {Object} : number of deactivated documents of VisitorDetails. {status, message, data}
 */
const softDeleteManyVisitorDetails = async (req, res) => {
    try {
        let ids = req.body.ids;
        if (!ids || !Array.isArray(ids) || ids.length < 1) {
            return res.badRequest();
        }
        const query = { _id: { $in: ids } };
        const updateBody = { isDeleted: true, };
        let updatedVisitorDetails = await dbService.updateMany(VisitorDetails, query, updateBody);
        if (!updatedVisitorDetails) {
            return res.recordNotFound();
        }
        return res.success({ data: { count: updatedVisitorDetails } });

    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

module.exports = {
    addVisitorDetails,
    bulkInsertVisitorDetails,
    findAllVisitorDetails,
    getVisitorDetails,
    getVisitorDetailsCount,
    updateVisitorDetails,
    bulkUpdateVisitorDetails,
    partialUpdateVisitorDetails,
    softDeleteVisitorDetails,
    deleteVisitorDetails,
    deleteManyVisitorDetails,
    softDeleteManyVisitorDetails
};