/**
 * default_variableValidation.js
 * @description :: validate each post and put request as per default_variable model
 */

const joi = require('joi');
const {
  options, isCountOnly, populate, select 
} = require('./commonFilterValidation');

/** validation keys and properties of default_variable */
exports.schemaKeys = joi.object({
  default_id: joi.string().allow(null).allow(''),
  value: joi.string().allow(null).allow(''),
  group: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean()
}).unknown(true);

/** validation keys and properties of default_variable for updation */
exports.updateSchemaKeys = joi.object({
  default_id: joi.string().allow(null).allow(''),
  value: joi.string().allow(null).allow(''),
  group: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean(),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of default_variable for filter documents from collection */
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      default_id: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      value: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      group: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      isDeleted: joi.alternatives().try(joi.array().items(),joi.boolean(),joi.object()),
      id: joi.any(),
      _id: joi.alternatives().try(joi.array().items(),joi.string().regex(/^[0-9a-fA-F]{24}$/),joi.object())
    }).unknown(true),])
  ),
  isCountOnly: isCountOnly,
  populate: joi.array().items(populate),
  select: select
    
}).unknown(true);
