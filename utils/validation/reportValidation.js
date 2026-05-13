const joi = require('joi');
const {
  options, isCountOnly, populate, select
} = require('./commonFilterValidation');

/** validation keys and properties of report */
exports.schemaKeys = joi.object({
  item_id: joi.string().allow(null).allow(''),
  gaushala_id: joi.string().allow(null).allow(''),
  item_type: joi.string().allow(null).allow(''),
  date: joi.string().allow(null).allow(''),
  item_add_in_month: joi.number().allow(0),
  item_out_in_month: joi.number().allow(0),
  item_amount_add_in_month: joi.number().allow(0),
  item_amount_out_in_month: joi.number().allow(0),
  opening_qty_of_item: joi.number().allow(0),
  closing_qty_of_item: joi.number().allow(0),
  opening_amount: joi.number().allow(0),
  closing_amount: joi.number().allow(0),
  isDeleted: joi.boolean(),
  isActive: joi.boolean()
}).unknown(true);

/** validation keys and properties of report for updation */
exports.updateSchemaKeys = joi.object({
  item_id: joi.string().allow(null).allow(''),
  gaushala_id: joi.string().allow(null).allow(''),
  item_type: joi.string().allow(null).allow(''),
  date: joi.string().allow(null).allow(''),
  item_add_in_month: joi.number().allow(0),
  item_out_in_month: joi.number().allow(0),
  item_amount_add_in_month: joi.number().allow(0),
  item_amount_out_in_month: joi.number().allow(0),
  opening_qty_of_item: joi.number().allow(0),
  closing_qty_of_item: joi.number().allow(0),
  opening_amount: joi.number().allow(0),
  closing_amount: joi.number().allow(0),
  isDeleted: joi.boolean(),
  isActive: joi.boolean(),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of report for filter documents from collection */
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      item_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      gaushala_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      item_type: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      date: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      item_add_in_month: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      item_out_in_month: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      item_amount_add_in_month: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      item_amount_out_in_month: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      opening_qty_of_item: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      closing_qty_of_item: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      opening_amount: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      closing_amount: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      isDeleted: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      isActive: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      id: joi.any(),
      _id: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object())
    }).unknown(true),])
  ),
  isCountOnly: isCountOnly,
  populate: joi.array().items(populate),
  select: select

}).unknown(true);