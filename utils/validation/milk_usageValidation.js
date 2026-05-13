const joi = require('joi');
const {
  options, isCountOnly, populate, select
} = require('./commonFilterValidation');

/** validation keys and properties of milk_usage */
exports.schemaKeys = joi.object({
  liter: joi.string().allow(null).allow(''),
  used_in: joi.string().allow(null).allow(''),
  distribution_person: joi.string().allow(null).allow(''),
  description: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean(),
  isActive: joi.boolean()
}).unknown(true);

/** validation keys and properties of milk_usage for updation */
exports.updateSchemaKeys = joi.object({
  liter: joi.string().allow(null).allow(''),
  used_in: joi.string().allow(null).allow(''),
  distribution_person: joi.string().allow(null).allow(''),
  date: joi.string(),
  description: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean(),
  isActive: joi.boolean(),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of milk_usage for filter documents from collection */
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      liter: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      used_in: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      distribution_person: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      date: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      description: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
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