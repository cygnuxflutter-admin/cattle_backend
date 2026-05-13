/**
 * COWValidation.js
 * @description :: validate each post and put request as per COW model
 */

const joi = require('joi');
const {
  options, isCountOnly, populate, select
} = require('./commonFilterValidation');
const { convertObjectToEnum } = require('../common');
const authConstantDefault = require('../../constants/authConstant');

/** validation keys and properties of COW */
exports.schemaKeys = joi.object({
  breed: joi.string().allow(null).allow(''),
  type: joi.string().allow(null).allow(''),
  shed_id: joi.string().allow(null).allow(''),
  tag_id: joi.alternatives().try(joi.string(), joi.number().integer().allow(0)),
  dob: joi.string().allow(null).allow(''),
  calf_name: joi.string().allow(null).allow(''),
  isFemale: joi.boolean(),
  isDeleted: joi.boolean(),
  calf_weight: joi.number().allow(0),
  dam_id: joi.string().allow(null).allow(''),
  dam_name: joi.string().allow(null).allow(''),
  sair_id: joi.string().allow(null).allow(''),
  sair_name: joi.string().allow(null).allow(''),
  delivery_time: joi.string().allow(null).allow(''),
  send_died_date: joi.string().allow(null).allow(''),
  purchase_date: joi.string().allow(null).allow(''),
  remark: joi.string().allow(null).allow('')
}).unknown(true);

/** validation keys and properties of COW for updation */
exports.updateSchemaKeys = joi.object({
  breed: joi.string().allow(null).allow(''),
  type: joi.string().allow(null).allow(''),
  shed_id: joi.string().allow(null).allow(''),
  tag_id: joi.alternatives().try(joi.string(), joi.number().integer().allow(0)),
  dob: joi.string().allow(null).allow(''),
  calf_name: joi.string().allow(null).allow(''),
  userType: joi.number().allow(0),
  isFemale: joi.boolean(),
  isDeleted: joi.boolean(),
  calf_weight: joi.number().allow(0),
  dam_id: joi.string().allow(null).allow(''),
  dam_name: joi.string().allow(null).allow(''),
  sair_id: joi.string().allow(null).allow(''),
  sair_name: joi.string().allow(null).allow(''),
  delivery_time: joi.string().allow(null).allow(''),
  send_died_date: joi.string().allow(null).allow(''),
  purchase_date: joi.string().allow(null).allow(''),
  remark: joi.string().allow(null).allow(''),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of COW for filter documents from collection */
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      breed: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      type: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      shed_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      tag_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.number().integer(), joi.object()),
      dob: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      calf_name: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      isFemale: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      isDeleted: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      calf_weight: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      dam_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      dam_name: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      sair_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      sair_name: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      delivery_time: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      send_died_date: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      purchase_date: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      remark: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      id: joi.any(),
      _id: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object())
    }).unknown(true),])
  ),
  isCountOnly: isCountOnly,
  populate: joi.array().items(populate),
  select: select

}).unknown(true);
