/**
 * sales_itemsController.js
 * @description : exports action methods for sales_items.
 */

const Sales_items = require('../../../model/sales_items');
const sales_itemsSchemaKey = require('../../../utils/validation/sales_itemsValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/common');

/**
 * @description : create document of Sales_items in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Sales_items. {status, message, data}
 */
const addSales_items = async (req, res) => {
    try {
        let dataToCreate = { ...req.body || {} };
        let validateRequest = validation.validateParamsWithJoi(
            dataToCreate,
            sales_itemsSchemaKey.schemaKeys);
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }

        // const maxItemIdDoc = await Item_master.findOne({}, {}, { sort: { ItemId: -1 } }).lean();
        const allItems = await Sales_items.find();
        const maxItemIdDoc = allItems[allItems.length - 1];

        let nextItemId = "1"; // Default if no records exist yet

        if (maxItemIdDoc && maxItemIdDoc.item_id) {

            const maxItemIdInt = parseInt(maxItemIdDoc.item_id);

            nextItemId = (maxItemIdInt + 1).toString();
        }

        dataToCreate.item_id = nextItemId;


        const checkItemId = await Sales_items.findOne({ item_id: nextItemId, gaushala_id: req.user.gaushala_id }).lean();
        if (checkItemId !== null) {
            return res.internalServerError({ message: `Item id already exists` });
        }

        dataToCreate.gaushala_id = req.user.gaushala_id
        dataToCreate = new Sales_items(dataToCreate);
        let createdSales_items = await dbService.create(Sales_items, dataToCreate);
        return res.success({ data: createdSales_items });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : create multiple documents of Sales_items in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created Sales_itemss. {status, message, data}
 */
const bulkInsertSales_items = async (req, res) => {
    try {
        if (req.body && (!Array.isArray(req.body.data) || req.body.data.length < 1)) {
            return res.badRequest();
        }
        let dataToCreate = [...req.body.data];
        for (let i = 0; i < dataToCreate.length; i++) {
            dataToCreate[i].gaushala_id = req.user.gaushala_id
        }
        let createdSales_itemss = await dbService.create(Sales_items, dataToCreate);
        createdSales_itemss = { count: createdSales_itemss ? createdSales_itemss.length : 0 };
        return res.success({ data: { count: createdSales_itemss.count || 0 } });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : find all documents of Sales_items from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Sales_items(s). {status, message, data}
 */
const findAllSales_items = async (req, res) => {
    try {
        let options = {};
        let query = {};
        query.gaushala_id = req.user.gaushala_id;
        let validateRequest = validation.validateFilterWithJoi(
            req.body,
            sales_itemsSchemaKey.findFilterKeys,
            Sales_items.schema.obj
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `${validateRequest.message}` });
        }
        if (typeof req.body.query === 'object' && req.body.query !== null) {
            query = { ...req.body.query };
        }
        if (req.body.isCountOnly) {
            let totalRecords = await dbService.count(Sales_items, query);
            return res.success({ data: { totalRecords } });
        }
        if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
            options = { ...req.body.options };
        }
        let foundSales_itemss = await dbService.findAll(Sales_items, query, options);
        if (!foundSales_itemss) {
            return res.recordNotFound();
        }
        return res.success({ data: foundSales_itemss });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : find document of Sales_items from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Sales_items. {status, message, data}
 */
const getSales_items = async (req, res) => {
    try {
        let query = {};
        query.gaushala_id = req.user.gaushala_id;
        if (!ObjectId.isValid(req.params.id)) {
            return res.validationError({ message: 'invalid objectId.' });
        }
        query._id = req.params.id;
        let options = {};
        let foundSales_items = await dbService.findOne(Sales_items, query, options);
        if (!foundSales_items) {
            return res.recordNotFound();
        }
        return res.success({ data: foundSales_items });
    }
    catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : returns total number of documents of Sales_items.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getSales_itemsCount = async (req, res) => {
    try {
        let where = {};
        where.gaushala_id = req.user.gaushala_id;
        let validateRequest = validation.validateFilterWithJoi(
            req.body,
            sales_itemsSchemaKey.findFilterKeys,
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `${validateRequest.message}` });
        }
        if (typeof req.body.where === 'object' && req.body.where !== null) {
            where = { ...req.body.where };
        }
        let countedSales_items = await dbService.count(Sales_items, where);
        return res.success({ data: { count: countedSales_items } });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : update document of Sales_items with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Sales_items.
 * @return {Object} : updated Sales_items. {status, message, data}
 */
const updateSales_items = async (req, res) => {
    try {
        let dataToUpdate = { ...req.body, };
        let validateRequest = validation.validateParamsWithJoi(
            dataToUpdate,
            sales_itemsSchemaKey.updateSchemaKeys
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }
        let query = { _id: req.params.id };
        query.gaushala_id = req.user.gaushala_id;
        let updatedSales_items = await dbService.updateOne(Sales_items, query, dataToUpdate);
        if (!updatedSales_items) {
            return res.recordNotFound();
        }
        return res.success({ data: updatedSales_items });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : update multiple records of Sales_items with data by filter.
 * @param {Object} req : request including filter and data in request body.
 * @param {Object} res : response of updated Sales_itemss.
 * @return {Object} : updated Sales_itemss. {status, message, data}
 */
const bulkUpdateSales_items = async (req, res) => {
    try {
        let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
        filter.gaushala_id = req.user.gaushala_id;
        let dataToUpdate = {};
        if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
            dataToUpdate = { ...req.body.data, };
        }
        let updatedSales_items = await dbService.updateMany(Sales_items, filter, dataToUpdate);
        if (!updatedSales_items) {
            return res.recordNotFound();
        }
        return res.success({ data: { count: updatedSales_items } });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

/**
 * @description : partially update document of Sales_items with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated Sales_items.
 * @return {obj} : updated Sales_items. {status, message, data}
 */
const partialUpdateSales_items = async (req, res) => {
    try {
        if (!req.params.id) {
            res.badRequest({ message: 'Insufficient request parameters! id is required.' });
        }
        let dataToUpdate = { ...req.body, };
        let validateRequest = validation.validateParamsWithJoi(
            dataToUpdate,
            sales_itemsSchemaKey.updateSchemaKeys
        );
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }
        let query = { _id: req.params.id };
        query.gaushala_id = req.user.gaushala_id;
        let updatedSales_items = await dbService.updateOne(Sales_items, query, dataToUpdate);
        if (!updatedSales_items) {
            return res.recordNotFound();
        }
        return res.success({ data: updatedSales_items });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

module.exports = {
    addSales_items,
    bulkInsertSales_items,
    findAllSales_items,
    getSales_items,
    getSales_itemsCount,
    updateSales_items,
    bulkUpdateSales_items,
    partialUpdateSales_items
};