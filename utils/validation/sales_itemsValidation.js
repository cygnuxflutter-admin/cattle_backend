const joi = require('joi');
const {
  options, isCountOnly, populate, select
} = require('./commonFilterValidation');

/** validation keys and properties of sales_items */
exports.schemaKeys = joi.object({
  item_id: joi.string().allow(null).allow(''),
  item_name: joi.string().allow(null).allow(''),
  unit: joi.string().allow(null).allow(''),
  piece_qty: joi.string().allow(null).allow(''),
  rate_per_unit: joi.number().integer().allow(0),
  isDeliver: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);

/** validation keys and properties of sales_items for updation */
exports.updateSchemaKeys = joi.object({
  item_id: joi.string().allow(null).allow(''),
  item_name: joi.string().allow(null).allow(''),
  unit: joi.string().allow(null).allow(''),
  piece_qty: joi.string().allow(null).allow(''),
  rate_per_unit: joi.number().integer().allow(0),
  isDeliver: joi.boolean(),
  isDeleted: joi.boolean(),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of sales_items for filter documents from collection */
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      item_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      item_name: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      unit: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      piece_qty: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      rate_per_unit: joi.alternatives().try(joi.array().items(), joi.number().integer(), joi.object()),
      isDeliver: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      isDeleted: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      id: joi.any(),
      _id: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object())
    }).unknown(true),])
  ),
  isCountOnly: isCountOnly,
  populate: joi.array().items(populate),
  select: select

}).unknown(true);
