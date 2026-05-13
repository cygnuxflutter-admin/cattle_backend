/**
 * sales_reportController.js
 * @description : exports action methods for sales_report.
 */

const Sales_report = require('../../../model/sales_report');
const sales_reportSchemaKey = require('../../../utils/validation/sales_reportValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/common');

/**
 * @description : create document of Sales_report in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Sales_report. {status, message, data}
 */
const addSales_report = async (req, res) => {
    try {
        let dataToCreate = { ...req.body || {} };
        let validateRequest = validation.validateParamsWithJoi(
            dataToCreate,
            sales_reportSchemaKey.schemaKeys);
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }
        dataToCreate.gaushala_id = req.user.gaushala_id

        dataToCreate = new Sales_report(dataToCreate);
        let createdSales_report = await dbService.create(Sales_report, dataToCreate);
        return res.success({ data: createdSales_report });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : create multiple documents of Sales_report in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created Sales_reports. {status, message, data}
 */
const bulkInsertSales_report = async (req, res) => {
    try {
        if (req.body && (!Array.isArray(req.body.data) || req.body.data.length < 1)) {
            return res.badRequest();
        }
        let dataToCreate = [...req.body.data];
        for (let i = 0; i < dataToCreate.length; i++) {
            dataToCreate[i].gaushala_id = req.user.gaushala_id
        }
        let createdSales_reports = await dbService.create(Sales_report, dataToCreate);
        createdSales_reports = { count: createdSales_reports ? createdSales_reports.length : 0 };
        return res.success({ data: { count: createdSales_reports.count || 0 } });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : find all documents of Sales_report from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Sales_report(s). {status, message, data}
 */
const findAllSales_report = async (req, res) => {
    try {
        let options = {};
        let query = {};
        query.gaushala_id = req.user.gaushala_id;
        query.date = {
            $regex: `^${req.body.year}-\\d{2}-\\d{2}`, // Matches '2023-10-XX' format
        };
        let validateRequest = validation.validateFilterWithJoi(
            req.body,
            sales_reportSchemaKey.findFilterKeys,
            Sales_report.schema.obj
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `${validateRequest.message}` });
        }
        if (typeof req.body.query === 'object' && req.body.query !== null) {
            query = { ...req.body.query };
        }
        if (req.body.isCountOnly) {
            let totalRecords = await dbService.count(Sales_report, query);
            return res.success({ data: { totalRecords } });
        }
        if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
            options = { ...req.body.options };
        }
        let foundSales_reports = await dbService.findAll(Sales_report, query, options);
        if (!foundSales_reports || !foundSales_reports.length === 0) {
            return res.recordNotFound();
        }
        return res.success({ data: foundSales_reports });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : find document of Sales_report from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Sales_report. {status, message, data}
 */
const getSales_report = async (req, res) => {
    try {
        let query = {};
        query.gaushala_id = req.user.gaushala_id;
        if (!ObjectId.isValid(req.params.id)) {
            return res.validationError({ message: 'invalid objectId.' });
        }
        query._id = req.params.id;
        let options = {};
        let foundSales_report = await dbService.findOne(Sales_report, query, options);
        if (!foundSales_report) {
            return res.recordNotFound();
        }
        return res.success({ data: foundSales_report });
    }
    catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : returns total number of documents of Sales_report.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getSales_reportCount = async (req, res) => {
    try {
        let where = {};
        where.gaushala_id = req.user.gaushala_id;
        let validateRequest = validation.validateFilterWithJoi(
            req.body,
            sales_reportSchemaKey.findFilterKeys,
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `${validateRequest.message}` });
        }
        if (typeof req.body.where === 'object' && req.body.where !== null) {
            where = { ...req.body.where };
        }
        let countedSales_report = await dbService.count(Sales_report, where);
        return res.success({ data: { count: countedSales_report } });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : update document of Sales_report with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Sales_report.
 * @return {Object} : updated Sales_report. {status, message, data}
 */
const updateSales_report = async (req, res) => {
    try {
        let dataToUpdate = { ...req.body, };
        let validateRequest = validation.validateParamsWithJoi(
            dataToUpdate,
            sales_reportSchemaKey.updateSchemaKeys
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }
        let query = { _id: req.params.id };
        query.gaushala_id = req.user.gaushala_id;
        let updatedSales_report = await dbService.updateOne(Sales_report, query, dataToUpdate);
        if (!updatedSales_report) {
            return res.recordNotFound();
        }
        return res.success({ data: updatedSales_report });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : update multiple records of Sales_report with data by filter.
 * @param {Object} req : request including filter and data in request body.
 * @param {Object} res : response of updated Sales_reports.
 * @return {Object} : updated Sales_reports. {status, message, data}
 */
const bulkUpdateSales_report = async (req, res) => {
    try {
        let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
        filter.gaushala_id = req.user.gaushala_id;
        let dataToUpdate = {};
        if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
            dataToUpdate = { ...req.body.data, };
        }
        let updatedSales_report = await dbService.updateMany(Sales_report, filter, dataToUpdate);
        if (!updatedSales_report) {
            return res.recordNotFound();
        }
        return res.success({ data: { count: updatedSales_report } });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : partially update document of Sales_report with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated Sales_report.
 * @return {obj} : updated Sales_report. {status, message, data}
 */
const partialUpdateSales_report = async (req, res) => {
    try {
        if (!req.params.id) {
            res.badRequest({ message: 'Insufficient request parameters! id is required.' });
        }
        let dataToUpdate = { ...req.body, };
        let validateRequest = validation.validateParamsWithJoi(
            dataToUpdate,
            sales_reportSchemaKey.updateSchemaKeys
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }
        let query = { _id: req.params.id };
        query.gaushala_id = req.user.gaushala_id;
        let updatedSales_report = await dbService.updateOne(Sales_report, query, dataToUpdate);
        if (!updatedSales_report) {
            return res.recordNotFound();
        }
        return res.success({ data: updatedSales_report });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};
/**
 * @description : deactivate document of Sales_report from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Sales_report.
 * @return {Object} : deactivated Sales_report. {status, message, data}
 */
const softDeleteSales_report = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
        }
        let query = { _id: req.params.id };
        query.gaushala_id = req.user.gaushala_id;
        const updateBody = { isDeleted: true, };
        let updatedSales_report = await dbService.updateOne(Sales_report, query, updateBody);
        if (!updatedSales_report) {
            return res.recordNotFound();
        }
        return res.success({ data: updatedSales_report });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : delete document of Sales_report from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted Sales_report. {status, message, data}
 */
const deleteSales_report = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
        }
        let query = { _id: req.params.id };
        query.gaushala_id = req.user.gaushala_id;
        const deletedSales_report = await dbService.deleteOne(Sales_report, query);
        if (!deletedSales_report) {
            return res.recordNotFound();
        }
        return res.success({ data: deletedSales_report });

    }
    catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : delete documents of Sales_report in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of documents deleted.
 * @return {Object} : no of documents deleted. {status, message, data}
 */
const deleteManySales_report = async (req, res) => {
    try {
        let ids = req.body.ids;
        if (!ids || !Array.isArray(ids) || ids.length < 1) {
            return res.badRequest();
        }
        let query = { _id: { $in: ids } };
        query.gaushala_id = req.user.gaushala_id;
        const deletedSales_report = await dbService.deleteMany(Sales_report, query);
        if (!deletedSales_report) {
            return res.recordNotFound();
        }
        return res.success({ data: { count: deletedSales_report } });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};
/**
 * @description : deactivate multiple documents of Sales_report from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated documents of Sales_report.
 * @return {Object} : number of deactivated documents of Sales_report. {status, message, data}
 */
const softDeleteManySales_report = async (req, res) => {
    try {
        let ids = req.body.ids;
        if (!ids || !Array.isArray(ids) || ids.length < 1) {
            return res.badRequest();
        }
        let query = { _id: { $in: ids } };
        query.gaushala_id = req.user.gaushala_id;
        const updateBody = { isDeleted: true, };
        let updatedSales_report = await dbService.updateMany(Sales_report, query, updateBody);
        if (!updatedSales_report) {
            return res.recordNotFound();
        }
        return res.success({ data: { count: updatedSales_report } });

    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

module.exports = {
    addSales_report,
    bulkInsertSales_report,
    findAllSales_report,
    getSales_report,
    getSales_reportCount,
    updateSales_report,
    bulkUpdateSales_report,
    partialUpdateSales_report,
    softDeleteSales_report,
    deleteSales_report,
    deleteManySales_report,
    softDeleteManySales_report
};