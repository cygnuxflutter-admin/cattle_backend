/**
 * userController.js
 * @description : exports action methods for user.
 */

const User = require('../../../model/user');
const userSchemaKey = require('../../../utils/validation/userValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const auth = require('../../../services/auth');
const deleteDependentService = require('../../../utils/deleteDependent');
const utils = require('../../../utils/common');

/**
 * @description : get information of logged-in User.
 * @param {Object} req : authentication token is required
 * @param {Object} res : Logged-in user information
 * @return {Object} : Logged-in user information {status, message, data}
 */
const getLoggedInUserInfo = async (req, res) => {
  try {
    const query = {
      _id: req.user.id,
      isDeleted: false
    };
    query.isActive = true;
    let foundUser = await dbService.findOne(User, query);
    if (!foundUser) {
      return res.recordNotFound();
    }
    return res.success({ data: foundUser });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find all documents of User from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found User(s). {status, message, data}
 */
const findAllUser = async (req, res) => {
  try {
    let options = {};
    let query = { isActive: true };
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      userSchemaKey.findFilterKeys,
      User.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    // if (typeof req.body.query === 'object' && req.body.query !== null) {
    //   query = { ...req.body.query };
    // }
    // query._id = { $ne: req.user.id };
    // if (req.body && req.body.query && req.body.query._id) {
    //   query._id.$in = [req.body.query._id];
    // }
    if (req.body.isCountOnly) {
      let totalRecords = await dbService.count(User, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundUsers = await dbService.findAll(User, query, options);
    if (!foundUsers) {
      return res.recordNotFound();
    }
    return res.success({ data: foundUsers });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find document of User from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found User. {status, message, data}
 */
const getUser = async (req, res) => {
  try {
    let query = {};
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message: 'invalid objectId.' });
    }
    query._id = req.params.id;
    let options = {};
    let foundUser = await dbService.findOne(User, query, options);
    if (!foundUser) {
      return res.recordNotFound();
    }
    return res.success({ data: foundUser });
  }
  catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : returns total number of documents of User.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getUserCount = async (req, res) => {
  try {
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      userSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedUser = await dbService.count(User, where);
    return res.success({ data: { count: countedUser } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update document of User with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated User.
 * @return {Object} : updated User. {status, message, data}
 */
const updateUser = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      userSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    const query = {
      _id: {
        $eq: req.params.id,
        $ne: req.user.id
      }
    };
    let updatedUser = await dbService.updateOne(User, query, dataToUpdate);
    if (!updatedUser) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedUser });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : partially update document of User with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated User.
 * @return {obj} : updated User. {status, message, data}
 */
const partialUpdateUser = async (req, res) => {
  try {
    if (!req.params.id) {
      res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      userSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    const query = {
      _id: {
        $eq: req.params.id,
        $ne: req.user.id
      }
    };
    let updatedUser = await dbService.updateOne(User, query, dataToUpdate);
    if (!updatedUser) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedUser });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : deactivate document of User from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of User.
 * @return {Object} : deactivated User. {status, message, data}
 */
const softDeleteUser = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    const query = {
      _id: {
        $eq: req.params.id,
        $ne: req.user.id
      }
    };
    const updateBody = { isDeleted: true, };
    let updatedUser = await deleteDependentService.softDeleteUser(query, updateBody);
    if (!updatedUser) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedUser });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : deactivate multiple documents of User from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated documents of User.
 * @return {Object} : number of deactivated documents of User. {status, message, data}
 */
const softDeleteManyUser = async (req, res) => {
  try {
    let ids = req.body.ids;
    if (!ids || !Array.isArray(ids) || ids.length < 1) {
      return res.badRequest();
    }
    const query = {
      _id: {
        $in: ids,
        $ne: req.user.id
      }
    };
    const updateBody = { isDeleted: true, };
    let updatedUser = await deleteDependentService.softDeleteUser(query, updateBody);
    if (!updatedUser) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedUser });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : change password
 * @param {Object} req : request including user credentials.
 * @param {Object} res : response contains updated user document.
 * @return {Object} : updated user document {status, message, data}
 */
const changePassword = async (req, res) => {
  try {
    let params = req.body;
    if (!req.user.id || !params.newPassword || !params.oldPassword) {
      return res.validationError({ message: 'Please Provide userId, new Password and Old password' });
    }
    let result = await auth.changePassword({
      ...params,
      userId: req.user.id
    });
    if (result.flag) {
      return res.failure({ message: result.data });
    }
    return res.success({ message: result.data });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update user profile.
 * @param {Object} req : request including user profile details to update in request body.
 * @param {Object} res : updated user document.
 * @return {Object} : updated user document. {status, message, data}
 */
const updateProfile = async (req, res) => {
  try {
    let data = req.body;
    let validateRequest = validation.validateParamsWithJoi(
      data,
      userSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    delete data.password;
    delete data.createdAt;
    delete data.updatedAt;
    if (data.id) delete data.id;
    let result = await dbService.updateOne(User, { _id: req.user.id }, data, { new: true });
    if (!result) {
      return res.recordNotFound();
    }
    return res.success({ data: result });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.validationError({ message: `Invalid Data, Validation Failed at ${error.message}` });
    }
    if (error.code && error.code === 11000) {
      return res.validationError({ message: 'Data duplication found.' });
    }
    return res.internalServerError({ message: error.message });
  }
};
module.exports = {
  getLoggedInUserInfo,
  findAllUser,
  getUser,
  getUserCount,
  updateUser,
  partialUpdateUser,
  softDeleteUser,
  softDeleteManyUser,
  changePassword,
  updateProfile
};