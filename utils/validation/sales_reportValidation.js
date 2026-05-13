/**
 * sales_reportValidation.js
 * @description :: validate each post and put request as per sales_report model
 */

const joi = require('joi');
const {
    options, isCountOnly, populate, select
} = require('./commonFilterValidation');

/** validation keys and properties of sales_report */
exports.schemaKeys = joi.object({
    gaushala_id: joi.string().allow(null).allow(''),
    date: joi.string().allow(null).allow(''),
    total_sales_amount: joi.number().integer().allow(0),
    isDeleted: joi.boolean(),
    isActive: joi.boolean()
}).unknown(true);

/** validation keys and properties of sales_report for updation */
exports.updateSchemaKeys = joi.object({
    gaushala_id: joi.string().allow(null).allow(''),
    date: joi.string().allow(null).allow(''),
    total_sales_amount: joi.number().integer().allow(0),
    isDeleted: joi.boolean(),
    isActive: joi.boolean(),
    _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of sales_report for filter documents from collection */
exports.findFilterKeys = joi.object({
    options: options,
    ...Object.fromEntries(
        keys.map(key => [key, joi.object({
            gaushala_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            date: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            total_sales_amount: joi.alternatives().try(joi.array().items(), joi.number().integer(), joi.object()),
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