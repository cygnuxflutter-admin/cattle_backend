/**
 * emp_joiningValidation.js
 * @description :: validate each post and put request as per emp_joining model
 */

const joi = require('joi');
const {
  options, isCountOnly, populate, select 
} = require('./commonFilterValidation');

/** validation keys and properties of emp_joining */
exports.schemaKeys = joi.object({
  emp_id: joi.string().allow(null).allow(''),
  join_date: joi.string().allow(null).allow(''),
  leave_date: joi.string().allow(null).allow(''),
  remark: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean(),
  isActive: joi.boolean()
}).unknown(true);

/** validation keys and properties of emp_joining for updation */
exports.updateSchemaKeys = joi.object({
  emp_id: joi.string().allow(null).allow(''),
  join_date: joi.string().allow(null).allow(''),
  leave_date: joi.string().allow(null).allow(''),
  remark: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean(),
  isActive: joi.boolean(),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of emp_joining for filter documents from collection */
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      emp_id: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      join_date: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      leave_date: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      remark: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      isDeleted: joi.alternatives().try(joi.array().items(),joi.boolean(),joi.object()),
      isActive: joi.alternatives().try(joi.array().items(),joi.boolean(),joi.object()),
      id: joi.any(),
      _id: joi.alternatives().try(joi.array().items(),joi.string().regex(/^[0-9a-fA-F]{24}$/),joi.object())
    }).unknown(true),])
  ),
  isCountOnly: isCountOnly,
  populate: joi.array().items(populate),
  select: select
    
}).unknown(true);