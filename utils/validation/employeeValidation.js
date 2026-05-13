const joi = require('joi');
const {
  options, isCountOnly, populate, select
} = require('./commonFilterValidation');

/** validation keys and properties of employee */
exports.schemaKeys = joi.object({
  emp_id: joi.string().allow(null).allow(''),
  isEmpTemporary: joi.boolean().required(),
  payroll_name: joi.string().allow(null).allow(''),
  joining_date: joi.string().allow(null).allow(''),
  gender: joi.string().allow(null).allow(''),
  adhar_name: joi.string().allow(null).allow(''),
  parent_spouse_name: joi.string().allow(null).allow(''),
  relationship: joi.string().allow(null).allow(''),
  dob: joi.string().allow(null).allow(''),
  adhar_number: joi.string().allow(null).allow(''),
  pan_card: joi.string().allow(null).allow(''),
  bank_account: joi.number().integer().allow(0),
  bank_name: joi.string().allow(null).allow(''),
  IFSC_code: joi.string().allow(null).allow(''),
  mobile_number: joi.number().integer().allow(0),
  UAN_no: joi.number().integer().allow(0),
  remark: joi.string().allow(null).allow(''),
  PF_no: joi.string().allow(null).allow(''),
  ESI_no: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean(),
  isActive: joi.boolean(),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

/** validation keys and properties of employee for updation */
exports.updateSchemaKeys = joi.object({
  emp_id: joi.string().allow(null).allow(''),
  payroll_name: joi.string().allow(null).allow(''),
  joining_date: joi.string().allow(null).allow(''),
  gender: joi.string().allow(null).allow(''),
  adhar_name: joi.string().allow(null).allow(''),
  parent_spouse_name: joi.string().allow(null).allow(''),
  relationship: joi.string().allow(null).allow(''),
  dob: joi.string().allow(null).allow(''),
  adhar_number: joi.string().allow(null).allow(''),
  pan_card: joi.string().allow(null).allow(''),
  bank_account: joi.number().integer().allow(0),
  bank_name: joi.string().allow(null).allow(''),
  IFSC_code: joi.string().allow(null).allow(''),
  mobile_number: joi.number().integer().allow(0),
  UAN_no: joi.number().integer().allow(0),
  remark: joi.string().allow(null).allow(''),
  PF_no: joi.string().allow(null).allow(''),
  ESI_no: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean(),
  isActive: joi.boolean(),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of employee for filter documents from collection */
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      emp_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      payroll_name: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      joining_date: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      gender: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      adhar_name: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      parent_spouse_name: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      relationship: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      dob: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      adhar_number: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      pan_card: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      bank_account: joi.alternatives().try(joi.array().items(), joi.number().integer(), joi.object()),
      bank_name: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      IFSC_code: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      mobile_number: joi.alternatives().try(joi.array().items(), joi.number().integer(), joi.object()),
      UAN_no: joi.alternatives().try(joi.array().items(), joi.number().integer(), joi.object()),
      remark: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      PF_no: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      ESI_no: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
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

exports.salaryUpdateSchemaKeys = joi.object({
  emp_id: joi.string().required(),
  date: joi.string().required(),
  amountDecided: joi.number().required(),
});