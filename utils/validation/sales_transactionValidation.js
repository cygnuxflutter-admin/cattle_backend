/**
 * sales_transactionValidation.js
 * @description :: validate each post and put request as per sales_transaction model
 */

const joi = require('joi');
const {
  options, isCountOnly, populate, select
} = require('./commonFilterValidation');

/** validation keys and properties of sales_transaction */
exports.schemaKeys = joi.object({
  gaushala_id: joi.string().allow(null).allow(''),
  department_id: joi.string().allow(null).allow(''),
  department_name: joi.string().allow(null).allow(''),
  item_name: joi.string().allow(null).allow(''),
  qty: joi.number().allow(null).allow(0),
  rate: joi.number().allow(null).allow(0), // Allow null, zero, or double values
  total: joi.number().integer().allow(0),
  mobile_number: joi.string().allow(null).allow(''),
  email: joi.string().allow(null).allow(''),
  vehicle_number: joi.string().allow(null).allow(''),
  driver_name: joi.string().allow(null).allow(''),
  location: joi.string().allow(null).allow(''),
  date: joi.string().allow(null).allow(''),
  sleep_number: joi.number().integer().allow(0),
  time: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean()
}).unknown(true);
/** validation keys and properties of sales_transaction for updation */
exports.updateSchemaKeys = joi.object({
  gaushala_id: joi.string().allow(null).allow(''),
  department_id: joi.string().allow(null).allow(''),
  department_name: joi.string().allow(null).allow(''),
  item_name: joi.string().allow(null).allow(''),
  qty: joi.number().allow(null).allow(0),
  rate: joi.number().allow(null).allow(0), // Allow null, zero, or double values
  total: joi.number().integer().allow(0),
  mobile_number: joi.string().allow(null).allow(''),
  email: joi.string().allow(null).allow(''),
  vehicle_number: joi.string().allow(null).allow(''),
  driver_name: joi.string().allow(null).allow(''),
  location: joi.string().allow(null).allow(''),
  date: joi.string().allow(null).allow(''),
  sleep_number: joi.number().integer().allow(0),
  time: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean(),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);
let keys = ['query', 'where'];
/** validation keys and properties of sales_transaction for filter documents from collection */
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      gaushala_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      department_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      department_name: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      item_name: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      qty: joi.alternatives().try(joi.array().items(), joi.number().allow(null).allow(0), joi.object()),
      rate: joi.alternatives().try(joi.array().items(), joi.number().allow(null).allow(0), joi.object()),
      total: joi.alternatives().try(joi.array().items(), joi.number().integer(), joi.object()),
      mobile_number: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      email: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      vehicle_number: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      driver_name: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      location: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      date: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      sleep_number: joi.alternatives().try(joi.array().items(), joi.number().integer(), joi.object()),
      time: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      isDeleted: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      id: joi.any(),
      _id: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object())
    }).unknown(true),])
  ),
  isCountOnly: isCountOnly,
  populate: joi.array().items(populate),
  select: select

}).unknown(true);
