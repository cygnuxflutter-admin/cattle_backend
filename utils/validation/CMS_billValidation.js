/**
 * CMS_billValidation.js
 * @description :: validate each post and put request as per CMS_bill model
 */

const joi = require('joi');
const {
  options, isCountOnly, populate, select 
} = require('./commonFilterValidation');

/** validation keys and properties of CMS_bill */
exports.schemaKeys = joi.object({
  CMS_no: joi.string().allow(null).allow(''),
  RFO_no: joi.string().allow(null).allow(''),
  date: joi.string().allow(null).allow(''),
  gaushala_id : joi.string().allow(null).allow(''),
  isDeleted: joi.boolean(),
  addedBy: joi.string().allow(null).allow('')
}).unknown(true);

/** validation keys and properties of CMS_bill for updation */
exports.updateSchemaKeys = joi.object({
  CMS_no: joi.string().allow(null).allow(''),
  RFO_no: joi.string().allow(null).allow(''),
  date: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean(),
  addedBy: joi.string().allow(null).allow(''),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of CMS_bill for filter documents from collection */
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      CMS_no: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      RFO_no: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      date: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      isDeleted: joi.alternatives().try(joi.array().items(),joi.boolean(),joi.object()),
      addedBy: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      id: joi.any(),
      _id: joi.alternatives().try(joi.array().items(),joi.string().regex(/^[0-9a-fA-F]{24}$/),joi.object())
    }).unknown(true),])
  ),
  isCountOnly: isCountOnly,
  populate: joi.array().items(populate),
  select: select
    
}).unknown(true);
