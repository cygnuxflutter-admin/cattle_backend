/**
 * milk_historyValidation.js
 * @description :: validate each post and put request as per milk_history model
 */

const joi = require('joi');
const {
  options, isCountOnly, populate, select
} = require('./commonFilterValidation');

/** validation keys and properties of milk_history */
exports.schemaKeys = joi.object({
  // day_time: joi.string().allow(null).allow(''),
  date: joi.string().allow(null).allow(''),
  morning_milk: joi.number().allow(0),
  evening_milk: joi.number().allow(0),
  milking_cows_morning: joi.number().allow(0),
  milking_cows_evening: joi.number().allow(0),
  total_milk: joi.number().allow(0),
  total_milking_cows: joi.string().allow(null).allow(''),
  // milkByCows: joi.string().allow(null).allow(''),
  totalGIRCows: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean()
}).unknown(true);

/** validation keys and properties of milk_history for updation */
exports.updateSchemaKeys = joi.object({
  // day_time: joi.string().allow(null).allow(''),
  date: joi.string().allow(null).allow(''),
  morning_milk: joi.number().allow(0),
  evening_milk: joi.number().allow(0),
  milking_cows_morning: joi.number().allow(0),
  milking_cows_evening: joi.number().allow(0),
  total_milk: joi.number().allow(0),
  total_milking_cows: joi.string().allow(null).allow(''),
  // milkByCows: joi.string().allow(null).allow(''),
  totalGIRCows: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean(),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of milk_history for filter documents from collection */
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      // day_time: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      date: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      morning_milk: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      evening_milk: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      milking_cows_morning: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      milking_cows_evening: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      total_milk: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      total_milking_cows: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      // milkByCows: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      totalGIRCows: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      isDeleted: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      id: joi.any(),
      _id: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object())
    }).unknown(true),])
  ),
  isCountOnly: isCountOnly,
  populate: joi.array().items(populate),
  select: select

}).unknown(true);
