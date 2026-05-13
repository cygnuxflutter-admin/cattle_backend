/**
 * milk_usageController.js
 * @description : exports action methods for milk_usage.
 */

const Milk_usage = require('../../../model/milk_usage');
const milk_usageSchemaKey = require('../../../utils/validation/milk_usageValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/common');

/**
 * @description : create document of Milk_usage in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Milk_usage. {status, message, data}
 */
const addMilk_usage = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      milk_usageSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    dataToCreate.gaushala_id = req.user.gaushala_id
    dataToCreate.date = utils.getTodayDate();
    // commented bcz authentication is not done
    //dataToCreate.addedBy = req.user.id;
    dataToCreate = new Milk_usage(dataToCreate);
    let createdMilk_usage = await dbService.create(Milk_usage, dataToCreate);
    return res.success({ data: createdMilk_usage });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : create multiple documents of Milk_usage in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created Milk_usages. {status, message, data}
 */
const bulkInsertMilk_usage = async (req, res) => {
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
    let createdMilk_usages = await dbService.create(Milk_usage, dataToCreate);
    createdMilk_usages = { count: createdMilk_usages ? createdMilk_usages.length : 0 };
    return res.success({ data: { count: createdMilk_usages.count || 0 } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find all documents of Milk_usage from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Milk_usage(s). {status, message, data}
 */
const findAllMilk_usage = async (req, res) => {
  try {
    let options = {};
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

    let foundMilk_usages = await dbService.findAll(Milk_usage, query, options);
    if (!foundMilk_usages || !foundMilk_usages.length) {
      return res.recordNotFound();
    }
    return res.success({ data: foundMilk_usages });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find document of Milk_usage from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Milk_usage. {status, message, data}
 */
const getMilk_usage = async (req, res) => {
  try {
    let query = {};
    query.gaushala_id = req.user.gaushala_id;
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message: 'invalid objectId.' });
    }
    query._id = req.params.id;
    let options = {};
    let foundMilk_usage = await dbService.findOne(Milk_usage, query, options);
    if (!foundMilk_usage) {
      return res.recordNotFound();
    }
    return res.success({ data: foundMilk_usage });
  }
  catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : returns total number of documents of Milk_usage.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getMilk_usageCount = async (req, res) => {
  try {
    let where = {};
    where.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      milk_usageSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedMilk_usage = await dbService.count(Milk_usage, where);
    return res.success({ data: { count: countedMilk_usage } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update document of Milk_usage with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Milk_usage.
 * @return {Object} : updated Milk_usage. {status, message, data}
 */
const updateMilk_usage = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      milk_usageSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedMilk_usage = await dbService.updateOne(Milk_usage, query, dataToUpdate);
    if (!updatedMilk_usage) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedMilk_usage });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : partially update document of Milk_usage with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated Milk_usage.
 * @return {obj} : updated Milk_usage. {status, message, data}
 */
const partialUpdateMilk_usage = async (req, res) => {
  try {
    if (!req.params.id) {
      res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    delete req.body['addedBy'];
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      milk_usageSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedMilk_usage = await dbService.updateOne(Milk_usage, query, dataToUpdate);
    if (!updatedMilk_usage) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedMilk_usage });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const getTodayMilkUsage = async (req, res) => {
  // const all_milk_usage = await dbService.findAll(Milk_usage, { gaushala_id: req.user.gaushala_id });
  const all_milk_usage = await dbService.findAll(Milk_usage, { gaushala_id: req.user.gaushala_id, date: utils.getTodayDate() });

  let todayMilkUsedInCurd = [];
  let todayMilkUsedInMilkPowder = [];
  let todayMilkUsedInMilkCounter = [];
  let todayMilkUsedInTajaMilk = [];
  let todayMilkUsedInSweet = [];
  let todayMilkUsedInDistributionFree = [];

  if (!all_milk_usage) {
    return res.recordNotFound();
  }

  for (let i = 0; i < all_milk_usage.length; i++) {

    // if (utils.isToday(all_milk_usage[i].createdAt)) {


    if (all_milk_usage[i].used_in == 'Curd') {

      todayMilkUsedInCurd.push({
        liter: all_milk_usage[i].liter,
        used_in: all_milk_usage[i].used_in,
        description: all_milk_usage[i].description
      });

    }

    if (all_milk_usage[i].used_in == 'Milk Powder') {
      todayMilkUsedInMilkPowder.push({
        liter: all_milk_usage[i].liter,
        used_in: all_milk_usage[i].used_in,
        description: all_milk_usage[i].description
      });
    }

    if (all_milk_usage[i].used_in == 'Milk Counter') {
      todayMilkUsedInMilkCounter.push({
        liter: all_milk_usage[i].liter,
        used_in: all_milk_usage[i].used_in,
        description: all_milk_usage[i].description
      });
    }

    if (all_milk_usage[i].used_in == 'Taja milk') {
      todayMilkUsedInTajaMilk.push({
        liter: all_milk_usage[i].liter,
        used_in: all_milk_usage[i].used_in,
        description: all_milk_usage[i].description
      });
    }

    if (all_milk_usage[i].used_in == 'Distribution-Free') {
      todayMilkUsedInDistributionFree.push({
        liter: all_milk_usage[i].liter,
        used_in: all_milk_usage[i].used_in,
        description: all_milk_usage[i].description
      });
    }

    if (all_milk_usage[i].used_in == 'Sweet') {
      todayMilkUsedInSweet.push({
        liter: all_milk_usage[i].liter,
        used_in: all_milk_usage[i].used_in,
        description: all_milk_usage[i].description
      });
    }

    // }
  }

  return res.success({
    data: {
      todayMilkUsedInCurd,
      todayMilkUsedInMilkPowder, todayMilkUsedInMilkCounter, todayMilkUsedInTajaMilk, todayMilkUsedInDistributionFree,
      todayMilkUsedInSweet
    }
  });

}

const updateMilk_usageDate = async (req, res) => {
  try {
    const findAllMilk_usage = await dbService.findMany(Milk_usage, { gaushala_id: req.user.gaushala_id });
    if (!findAllMilk_usage) {
      return res.recordNotFound();
    }

    for (var milk_usage of findAllMilk_usage) {
      const createdAt = milk_usage.createdAt.toISOString().substring(0, 10);
      console.log("milk_usage:", createdAt);

      console.log("milk_usage:", createdAt);

      console.log("milk_usage_date : ", createdAt.toString());
      milk_usage.date = createdAt.toString();
      await dbService.updateOne(Milk_usage, { _id: milk_usage.id }, milk_usage);
    }
  } catch (err) {
    return res.internalServerError({ message: err.message });
  }
}

module.exports = {
  getTodayMilkUsage,
  addMilk_usage,
  bulkInsertMilk_usage,
  findAllMilk_usage,
  getMilk_usage,
  getMilk_usageCount,
  updateMilk_usage,
  partialUpdateMilk_usage
};