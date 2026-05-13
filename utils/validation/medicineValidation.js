/**
 * medicineValidation.js
 * @description :: validate each post and put request as per medicine model
 */

const joi = require('joi');
const {
  options, isCountOnly, populate, select
} = require('./commonFilterValidation');

/** validation keys and properties of medicine */
exports.schemaKeys = joi.object({
  gaushala_id: joi.string().allow(null).allow(''),
  medical_id: joi.number().integer().allow(0),
  cowId: joi.string().allow(null).allow(''),
  vac_name: joi.string().allow(null).allow(''),
  dose: joi.number().integer().allow(0),
  next_dose_time: joi.string().allow(null).allow(''),
  date: joi.string().allow(null).allow(''),
  remark: joi.string().allow(null).allow(''),
  gap_in_day: joi.number().integer().allow(0),
  status: joi.string().allow(null).allow(''),
  added_by: joi.string().allow(null).allow(''),
  type: joi.string().allow(null).allow(''),
  to_date: joi.string().allow(null).allow(''),
  heat_attempt: joi.number().integer().allow(0),
  isDeleted: joi.boolean(),
  isActive: joi.boolean(),
  addedBy: joi.string().allow(null).allow(''),
  updatedBy: joi.string().allow(null).allow('')
}).unknown(true);

/** validation keys and properties of medicine for updation */
exports.updateSchemaKeys = joi.object({
  gaushala_id: joi.string().allow(null).allow(''),
  medical_id: joi.number().integer().allow(0),
  cowId: joi.string().allow(null).allow(''),
  vac_name: joi.string().allow(null).allow(''),
  dose: joi.number().integer().allow(0),
  next_dose_time: joi.string().allow(null).allow(''),
  date: joi.string().allow(null).allow(''),
  remark: joi.string().allow(null).allow(''),
  gap_in_day: joi.number().integer().allow(0),
  status: joi.string().allow(null).allow(''),
  added_by: joi.string().allow(null).allow(''),
  type: joi.string().allow(null).allow(''),
  to_date: joi.string().allow(null).allow(''),
  heat_attempt: joi.number().integer().allow(0),
  isDeleted: joi.boolean(),
  isActive: joi.boolean(),
  addedBy: joi.string().allow(null).allow(''),
  updatedBy: joi.string().allow(null).allow(''),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

exports.chechVaccineSchemaKey = joi.object({
  vac_name: joi.string().required(),
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of medicine for filter documents from collection */
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      gaushala_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      medical_id: joi.alternatives().try(joi.array().items(), joi.number().integer(), joi.object()),
      cowId: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      vac_name: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      dose: joi.alternatives().try(joi.array().items(), joi.number().integer(), joi.object()),
      next_dose_time: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      date: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      remark: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      gap_in_day: joi.alternatives().try(joi.array().items(), joi.number().integer(), joi.object()),
      status: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      added_by: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      type: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      to_date: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      heat_attempt: joi.alternatives().try(joi.array().items(), joi.number().integer(), joi.object()),
      isDeleted: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      isActive: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      addedBy: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      updatedBy: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      id: joi.any(),
      _id: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object())
    }).unknown(true),])
  ),
  isCountOnly: isCountOnly,
  populate: joi.array().items(populate),
  select: select

}).unknown(true);

exports.addMedicineSchemaKeys = joi.object({
  medical_id: joi.number().required(),
  item_id: joi.string().required(),
  item_name: joi.string().required(),
  count: joi.number().required(),
});

exports.removeMedicineSchemaKeys = joi.object({
  medical_id: joi.number().required(),
  item_id: joi.string().required(),
});