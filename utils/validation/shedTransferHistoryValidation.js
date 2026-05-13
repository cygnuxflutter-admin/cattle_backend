/**
 * shedTransferHistoryValidation.js
 * @description :: validate each post and put request as per shedTransferHistory model
 */

const joi = require('joi');
const {
  options, isCountOnly, populate, select 
} = require('./commonFilterValidation');

/** validation keys and properties of shedTransferHistory */
exports.schemaKeys = joi.object({
  userId: joi.string().allow(null).allow(''),
  cowId: joi.string().allow(null).allow(''),
  oldShed: joi.string().allow(null).allow(''),
  dateTime: joi.string().allow(null).allow(''),
  newShed: joi.string().allow(null).allow(''),
  description: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean(),
  createdAt: joi.date().options({ convert: true }).allow(null).allow('')
}).unknown(true);

/** validation keys and properties of shedTransferHistory for updation */
exports.updateSchemaKeys = joi.object({
  userId: joi.string().allow(null).allow(''),
  cowId: joi.string().allow(null).allow(''),
  oldShed: joi.string().allow(null).allow(''),
  dateTime: joi.string().allow(null).allow(''),
  newShed: joi.string().allow(null).allow(''),
  description: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean(),
  createdAt: joi.date().options({ convert: true }).allow(null).allow(''),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of shedTransferHistory for filter documents from collection */
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({ 
      userId: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      cowId: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      oldShed: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      dateTime: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      newShed: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      description: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      isDeleted: joi.alternatives().try(joi.array().items(),joi.boolean(),joi.object()),
      createdAt: joi.alternatives().try(joi.array().items(),joi.date().options({ convert: true }),joi.object()),
      id: joi.any(),
      _id: joi.alternatives().try(joi.array().items(),joi.string().regex(/^[0-9a-fA-F]{24}$/),joi.object())
    }).unknown(true),])
  ),
  isCountOnly: isCountOnly,
  populate: joi.array().items(populate),
  select: select
    
}).unknown(true);
