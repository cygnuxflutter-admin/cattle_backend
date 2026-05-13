/**
 * item_masterValidation.js
 * @description :: validate each post and put request as per item_master model
 */

const joi = require('joi');
const {
  options, isCountOnly, populate, select
} = require('./commonFilterValidation');

/** validation keys and properties of item_master */
exports.schemaKeys = joi.object({
  UnitType: joi.string().allow(null).allow(''),
  OutUnitType: joi.string().allow(null).allow(''),
  ExpenceType: joi.string().allow(null).allow(''),
  ItemId: joi.string().allow(null).allow(''),
  ItemName: joi.string().allow(null).allow(''),
  isStock: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);

/** validation keys and properties of item_master for updation */
exports.updateSchemaKeys = joi.object({
  UnitType: joi.string().allow(null).allow(''),
  OutUnitType: joi.string().allow(null).allow(''),
  ExpenceType: joi.string().allow(null).allow(''),
  ItemId: joi.string().allow(null).allow(''),
  ItemName: joi.string().allow(null).allow(''),
  isStock: joi.boolean(),
  isDeleted: joi.boolean(),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of item_master for filter documents from collection */
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      UnitType: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      OutUnitType: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      ExpenceType: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      ItemId: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      ItemName: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      isStock: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      isDeleted: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      id: joi.any(),
      _id: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object())
    }).unknown(true),])
  ),
  isCountOnly: isCountOnly,
  populate: joi.array().items(populate),
  select: select

}).unknown(true);
