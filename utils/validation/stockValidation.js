/**
 * stockValidation.js
 * @description :: validate each post and put request as per stock model
 */

const joi = require('joi');
const {
  options, isCountOnly, populate, select
} = require('./commonFilterValidation');

/** validation keys and properties of stock */
exports.schemaKeys = joi.object({
  RFO_no: joi.string().allow(null).allow(''),
  gaushala_id: joi.string().allow(null).allow(''),
  vendor_id: joi.string().allow(null).allow(''),
  bill_no: joi.string().allow(null).allow(''),
  item_id: joi.string().allow(null).allow(''),
  expence_type: joi.string().allow(null).allow(''),
  // unit_type: joi.string().allow(null).allow(''),
  qty: joi.string().allow(null).allow(''),
  kg_per_unit: joi.number().allow(0),
  rate_per_unit: joi.number().allow(0),
  totalWtOrQty: joi.number().allow(0),
  total_amount: joi.number().allow(0),
  entry_by: joi.string().allow(null).allow(''),
  remark: joi.string().allow(null).allow(''),
  isStock: joi.boolean(),
  date: joi.string().allow(null).allow(''),
  bill_date: joi.string().required(),
  isDeleted: joi.boolean()
}).unknown(true);

/** validation keys and properties of stock for updation */
exports.updateSchemaKeys = joi.object({
  RFO_no: joi.string().allow(null).allow(''),
  gaushala_id: joi.string().allow(null).allow(''),
  vendor_id: joi.string().allow(null).allow(''),
  bill_no: joi.string().allow(null).allow(''),
  item_id: joi.string().allow(null).allow(''),
  expence_type: joi.string().allow(null).allow(''),
  // unit_type: joi.string().allow(null).allow(''),
  qty: joi.string().allow(null).allow(''),
  kg_per_unit: joi.number().allow(0),
  rate_per_unit: joi.number().allow(0),
  totalWtOrQty: joi.number().allow(0),
  total_amount: joi.number().allow(0),
  entry_by: joi.string().allow(null).allow(''),
  remark: joi.string().allow(null).allow(''),
  isStock: joi.boolean(),
  date: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean(),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of stock for filter documents from collection */
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      RFO_no: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      gaushala_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      vendor_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      bill_no: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      item_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      expence_type: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      // unit_type: joi.alternatives().try(joi.array().items(),joi.string(),joi.object()),
      qty: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      kg_per_unit: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      rate_per_unit: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      totalWtOrQty: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      total_amount: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      entry_by: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      remark: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      isStock: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      date: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      isDeleted: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      id: joi.any(),
      _id: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object())
    }).unknown(true),])
  ),
  isCountOnly: isCountOnly,
  populate: joi.array().items(populate),
  select: select

}).unknown(true);
