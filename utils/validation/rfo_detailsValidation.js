/**
 * rfo_detailsValidation.js
 * @description :: validate each post and put request as per rfo_details model
 */

const joi = require('joi');
const {
  options, isCountOnly, populate, select
} = require('./commonFilterValidation');

/** validation keys and properties of rfo_details */
exports.schemaKeys = joi.object({
  RFO_no: joi.string().allow(null).allow(''),
  rfo_type: joi.string().allow(null).allow(''),
  paymentType: joi.string().allow(null).allow(''),
  vendor_id: joi.string().allow(null).allow(''),
  vendorName: joi.string().allow(null).allow(''),
  date: joi.string().allow(null).allow(''),
  fromDate: joi.string().allow(null).allow(''),
  toDate: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean()
}).unknown(true);

/** validation keys and properties of rfo_details for updation */
exports.updateSchemaKeys = joi.object({
  RFO_no: joi.string().allow(null).allow(''),
  rfo_type: joi.string().allow(null).allow(''),
  paymentType: joi.string().allow(null).allow(''),
  vendor_id: joi.string().allow(null).allow(''),
  vendorName: joi.string().allow(null).allow(''),
  date: joi.string().allow(null).allow(''),
  fromDate: joi.string().allow(null).allow(''),
  toDate: joi.string().allow(null).allow(''),
  isDeleted: joi.boolean(),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of rfo_details for filter documents from collection */
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      RFO_no: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      rfo_type: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      paymentType: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      vendor_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      vendorName: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      date: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      fromDate: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      toDate: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      isDeleted: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      id: joi.any(),
      _id: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object())
    }).unknown(true),])
  ),
  isCountOnly: isCountOnly,
  populate: joi.array().items(populate),
  select: select

}).unknown(true);
