/**
 * milkValidation.js
 * @description :: validate each post and put request as per milk model
 */

const joi = require('joi');
const {
  options, isCountOnly, populate, select 
} = require('./commonFilterValidation');

/** validation keys and properties of milk */
exports.schemaKeys = joi.object({
  cow_tag_id: joi.string().allow(null).allow(''),
  liter: joi.number().allow(0),
  takenBy : joi.string().allow(null).allow(''),
  date: joi.string().allow(null).allow(''),
  day_time: joi.string().allow(null).allow(''),
  remark: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean()
}).unknown(true);

/** validation keys and properties of milk for updation */
exports.updateSchemaKeys = joi.object({
  cow_tag_id: joi.string().allow(null).allow(''),
  liter: joi.number().allow(0),
  takenBy : joi.string().allow(null).allow(''),
  date: joi.string().allow(null).allow(''),
  day_time: joi.string().allow(null).allow(''),
  remark: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean(),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of milk for filter documents from collection */
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      cow_tag_id: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      liter: joi.alternatives().try(joi.array().items(),joi.number(),joi.object()),
      takenBy : joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      date: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      day_time: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      remark: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      isDeleted: joi.alternatives().try(joi.array().items(),joi.boolean(),joi.object()),
      id: joi.any(),
      _id: joi.alternatives().try(joi.array().items(),joi.string().regex(/^[0-9a-fA-F]{24}$/),joi.object())
    }).unknown(true),])
  ),
  isCountOnly: isCountOnly,
  populate: joi.array().items(populate),
  select: select
    
}).unknown(true);
