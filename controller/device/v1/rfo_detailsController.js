/**
 * rfo_detailsController.js
 * @description : exports action methods for rfo_details.
 */

const Rfo_details = require('../../../model/rfo_details');
const rfo_detailsSchemaKey = require('../../../utils/validation/rfo_detailsValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/common');

/**
 * @description : create document of Rfo_details in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Rfo_details. {status, message, data}
 */
const addRfo_details = async (req, res) => {
    try {
        let dataToCreate = { ...req.body || {} };
        let validateRequest = validation.validateParamsWithJoi(
            dataToCreate,
            rfo_detailsSchemaKey.schemaKeys);
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }
        dataToCreate.gaushala_id = req.user.gaushala_id;
        dataToCreate = new Rfo_details(dataToCreate);
        let createdRfo_details = await dbService.create(Rfo_details, dataToCreate);
        return res.success({ data: createdRfo_details });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : create multiple documents of Rfo_details in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created Rfo_detailss. {status, message, data}
 */
const bulkInsertRfo_details = async (req, res) => {
    try {
        if (req.body && (!Array.isArray(req.body.data) || req.body.data.length < 1)) {
            return res.badRequest();
        }
        let dataToCreate = [...req.body.data];
        let createdRfo_detailss = await dbService.create(Rfo_details, dataToCreate);
        createdRfo_detailss = { count: createdRfo_detailss ? createdRfo_detailss.length : 0 };
        return res.success({ data: { count: createdRfo_detailss.count || 0 } });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : find all documents of Rfo_details from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Rfo_details(s). {status, message, data}
 */
const findAllRfo_details = async (req, res) => {
    try {
        let options = {};
        let query = {};
        let validateRequest = validation.validateFilterWithJoi(
            req.body,
            rfo_detailsSchemaKey.findFilterKeys,
            Rfo_details.schema.obj
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `${validateRequest.message}` });
        }
        if (typeof req.body.query === 'object' && req.body.query !== null) {
            query = { ...req.body.query };
        }
        if (req.body.isCountOnly) {
            let totalRecords = await dbService.count(Rfo_details, query);
            return res.success({ data: { totalRecords } });
        }
        if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
            options = { ...req.body.options };
        }
        let foundRfo_detailss = await dbService.paginate(Rfo_details, query, options);
        if (!foundRfo_detailss || !foundRfo_detailss.data || !foundRfo_detailss.data.length) {
            return res.recordNotFound();
        }
        return res.success({ data: foundRfo_detailss });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : find document of Rfo_details from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Rfo_details. {status, message, data}
 */
const getRfo_details = async (req, res) => {
    try {
        let query = {};
        if (!ObjectId.isValid(req.params.id)) {
            return res.validationError({ message: 'invalid objectId.' });
        }
        query._id = req.params.id;
        let options = {};
        let foundRfo_details = await dbService.findOne(Rfo_details, query, options);
        if (!foundRfo_details) {
            return res.recordNotFound();
        }
        return res.success({ data: foundRfo_details });
    }
    catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : returns total number of documents of Rfo_details.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getRfo_detailsCount = async (req, res) => {
    try {
        let where = {};
        let validateRequest = validation.validateFilterWithJoi(
            req.body,
            rfo_detailsSchemaKey.findFilterKeys,
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `${validateRequest.message}` });
        }
        if (typeof req.body.where === 'object' && req.body.where !== null) {
            where = { ...req.body.where };
        }
        let countedRfo_details = await dbService.count(Rfo_details, where);
        return res.success({ data: { count: countedRfo_details } });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : update document of Rfo_details with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Rfo_details.
 * @return {Object} : updated Rfo_details. {status, message, data}
 */
const updateRfo_details = async (req, res) => {
    try {
        let dataToUpdate = { ...req.body, };
        let validateRequest = validation.validateParamsWithJoi(
            dataToUpdate,
            rfo_detailsSchemaKey.updateSchemaKeys
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }
        const query = { _id: req.params.id };
        let updatedRfo_details = await dbService.updateOne(Rfo_details, query, dataToUpdate);
        if (!updatedRfo_details) {
            return res.recordNotFound();
        }
        return res.success({ data: updatedRfo_details });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : update multiple records of Rfo_details with data by filter.
 * @param {Object} req : request including filter and data in request body.
 * @param {Object} res : response of updated Rfo_detailss.
 * @return {Object} : updated Rfo_detailss. {status, message, data}
 */
const bulkUpdateRfo_details = async (req, res) => {
    try {
        let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
        let dataToUpdate = {};
        if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
            dataToUpdate = { ...req.body.data, };
        }
        let updatedRfo_details = await dbService.updateMany(Rfo_details, filter, dataToUpdate);
        if (!updatedRfo_details) {
            return res.recordNotFound();
        }
        return res.success({ data: { count: updatedRfo_details } });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : partially update document of Rfo_details with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated Rfo_details.
 * @return {obj} : updated Rfo_details. {status, message, data}
 */
const partialUpdateRfo_details = async (req, res) => {
    try {
        if (!req.params.id) {
            res.badRequest({ message: 'Insufficient request parameters! id is required.' });
        }
        let dataToUpdate = { ...req.body, };
        let validateRequest = validation.validateParamsWithJoi(
            dataToUpdate,
            rfo_detailsSchemaKey.updateSchemaKeys
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }
        const query = { _id: req.params.id };
        let updatedRfo_details = await dbService.updateOne(Rfo_details, query, dataToUpdate);
        if (!updatedRfo_details) {
            return res.recordNotFound();
        }
        return res.success({ data: updatedRfo_details });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};
/**
 * @description : deactivate document of Rfo_details from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Rfo_details.
 * @return {Object} : deactivated Rfo_details. {status, message, data}
 */
const softDeleteRfo_details = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
        }
        let query = { _id: req.params.id };
        const updateBody = { isDeleted: true, };
        let updatedRfo_details = await dbService.updateOne(Rfo_details, query, updateBody);
        if (!updatedRfo_details) {
            return res.recordNotFound();
        }
        return res.success({ data: updatedRfo_details });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : delete document of Rfo_details from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted Rfo_details. {status, message, data}
 */
const deleteRfo_details = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
        }
        const query = { _id: req.params.id };
        const deletedRfo_details = await dbService.deleteOne(Rfo_details, query);
        if (!deletedRfo_details) {
            return res.recordNotFound();
        }
        return res.success({ data: deletedRfo_details });

    }
    catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : delete documents of Rfo_details in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of documents deleted.
 * @return {Object} : no of documents deleted. {status, message, data}
 */
const deleteManyRfo_details = async (req, res) => {
    try {
        let ids = req.body.ids;
        if (!ids || !Array.isArray(ids) || ids.length < 1) {
            return res.badRequest();
        }
        const query = { _id: { $in: ids } };
        const deletedRfo_details = await dbService.deleteMany(Rfo_details, query);
        if (!deletedRfo_details) {
            return res.recordNotFound();
        }
        return res.success({ data: { count: deletedRfo_details } });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};
/**
 * @description : deactivate multiple documents of Rfo_details from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated documents of Rfo_details.
 * @return {Object} : number of deactivated documents of Rfo_details. {status, message, data}
 */
const softDeleteManyRfo_details = async (req, res) => {
    try {
        let ids = req.body.ids;
        if (!ids || !Array.isArray(ids) || ids.length < 1) {
            return res.badRequest();
        }
        const query = { _id: { $in: ids } };
        const updateBody = { isDeleted: true, };
        let updatedRfo_details = await dbService.updateMany(Rfo_details, query, updateBody);
        if (!updatedRfo_details) {
            return res.recordNotFound();
        }
        return res.success({ data: { count: updatedRfo_details } });

    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

module.exports = {
    addRfo_details,
    bulkInsertRfo_details,
    findAllRfo_details,
    getRfo_details,
    getRfo_detailsCount,
    updateRfo_details,
    bulkUpdateRfo_details,
    partialUpdateRfo_details,
    softDeleteRfo_details,
    deleteRfo_details,
    deleteManyRfo_details,
    softDeleteManyRfo_details
};
