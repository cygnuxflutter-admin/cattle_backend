/**
 * vendorController.js
 * @description : exports action methods for vendor.
 */

const Vendor = require('../../../model/vdr.js');
const vendorSchemaKey = require('../../../utils/validation/vdrValidation.js');
const validation = require('../../../utils/validateRequest.js');
const dbService = require('../../../utils/dbService.js');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/common.js');
const vendor = require('../../../model/vdr.js');

/**
 * @description : create document of Vendor in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Vendor. {status, message, data}
 */
const addVendor = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      vendorSchemaKey.schemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({
        message: `Invalid values in parameters, ${validateRequest.message}`,
      });
    }

    const gaushala_id = req.user.gaushala_id

    const allVendorCode = await vendor.find({ gaushala_id: gaushala_id });
    let allCodes = [];

    // Use a for...of loop to iterate through the vendor documents
    if (allVendorCode.length > 0) {
      for (const vendorDoc of allVendorCode) {
        // Access the Code property of each vendor document
        const code = vendorDoc.Code;
        allCodes.push(code.replace('V', ''));
      }

      let greatestCode = Math.max(...allCodes.map(Number));

      dataToCreate.Code = `V${greatestCode += 1}`
    } else {
      dataToCreate.Code = `V1`
    }

    dataToCreate.gaushala_id = gaushala_id

    dataToCreate = new Vendor(dataToCreate);

    let createdVendor = await dbService.create(Vendor, dataToCreate);
    return res.success({ data: createdVendor });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find all documents of Vendor from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Vendor(s). {status, message, data}
 */
const findAllVendor = async (req, res) => {
  try {
    let options = {};
    let query = {};
    query.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      vendorSchemaKey.findFilterKeys,
      Vendor.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
    if (req.body.isCountOnly) {
      let totalRecords = await dbService.count(Vendor, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundVendors = await dbService.findAll(Vendor, query, options);
    if (!foundVendors) {
      return res.recordNotFound();
    }
    return res.success({ data: foundVendors });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find document of Vendor from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Vendor. {status, message, data}
 */
const getVendor = async (req, res) => {
  try {
    let query = {};
    query.gaushala_id = req.user.gaushala_id;
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message: 'invalid objectId.' });
    }
    query._id = req.params.id;
    let options = {};
    let foundVendor = await dbService.findOne(Vendor, query, options);
    if (!foundVendor) {
      return res.recordNotFound();
    }
    return res.success({ data: foundVendor });
  }
  catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : returns total number of documents of Vendor.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getVendorCount = async (req, res) => {
  try {
    let where = {};
    where.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      vendorSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedVendor = await dbService.count(Vendor, where);
    return res.success({ data: { count: countedVendor } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update document of Vendor with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Vendor.
 * @return {Object} : updated Vendor. {status, message, data}
 */
const updateVendor = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      vendorSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedVendor = await dbService.updateOne(Vendor, query, dataToUpdate);
    if (!updatedVendor) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedVendor });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : partially update document of Vendor with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated Vendor.
 * @return {obj} : updated Vendor. {status, message, data}
 */
const partialUpdateVendor = async (req, res) => {
  try {
    if (!req.params.id) {
      res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      vendorSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedVendor = await dbService.updateOne(Vendor, query, dataToUpdate);
    if (!updatedVendor) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedVendor });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

module.exports = {
  addVendor,
  findAllVendor,
  getVendor,
  getVendorCount,
  updateVendor,
  partialUpdateVendor
};