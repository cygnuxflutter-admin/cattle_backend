/**
 * vendorValidation.js
 * @description :: validate each post and put request as per vendor model
 */

const joi = require('joi');
const {
  options, isCountOnly, populate, select 
} = require('./commonFilterValidation');

/** validation keys and properties of vendor */
exports.schemaKeys = joi.object({
  Code: joi.string().allow(null).allow(''),
  Group: joi.string().allow(null).allow(''),
  Name: joi.string().allow(null).allow(''),
  Mobile_No: joi.number().integer().allow(0),
  GST_Number: joi.string().allow(null).allow(''),
  Pan_Number: joi.string().allow(null).allow(''),
  Bank_Name: joi.string().allow(null).allow(''),
  Account_Number: joi.string().allow(null).allow(''),
  IFSC_Code: joi.string().allow(null).allow(''),
  gaushala_id: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean(),
  isActive: joi.boolean()
}).unknown(true);

/** validation keys and properties of vendor for updation */
exports.updateSchemaKeys = joi.object({
  Code: joi.string().allow(null).allow(''),
  Group: joi.string().allow(null).allow(''),
  Name: joi.string().allow(null).allow(''),
  Mobile_No: joi.number().integer().allow(0),
  GST_Number: joi.string().allow(null).allow(''),
  Pan_Number: joi.string().allow(null).allow(''),
  Bank_Name: joi.string().allow(null).allow(''),
  Account_Number: joi.string().allow(null).allow(''),
  IFSC_Code: joi.string().allow(null).allow(''),
  gaushala_id: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean(),
  isActive: joi.boolean(),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of vendor for filter documents from collection */
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      Code: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      Group: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      Name: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      Mobile_No: joi.alternatives().try(joi.array().items(),joi.number().integer(),joi.object()),
      GST_Number: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      Pan_Number: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      Bank_Name: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      Account_Number: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      IFSC_Code: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      gaushala_id: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
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
