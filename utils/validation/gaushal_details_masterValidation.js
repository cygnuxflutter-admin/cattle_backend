/**
 * gaushal_details_masterValidation.js
 * @description :: validate each post and put request as per gaushal_details_master model
 */

const joi = require('joi');
const {
    options, isCountOnly, populate, select
} = require('./commonFilterValidation');

/** validation keys and properties of gaushal_details_master */
exports.schemaKeys = joi.object({
    gaushala_id: joi.string().allow(null).allow(''),
    cattle_count: joi.number().integer().allow(0),
    expense: joi.number().allow(0),
    per_cattle_expense: joi.number().allow(0),
    production: joi.number().allow(0),
    stock: joi.number().allow(0),
    date: joi.string().allow(null).allow(''),
    isDeleted: joi.boolean()
}).unknown(true);

/** validation keys and properties of gaushal_details_master for updation */
exports.updateSchemaKeys = joi.object({
    gaushala_id: joi.string().allow(null).allow(''),
    cattle_count: joi.number().integer().allow(0),
    expense: joi.number().allow(0),
    per_cattle_expense: joi.number().allow(0),
    production: joi.number().allow(0),
    stock: joi.number().allow(0),
    date: joi.string().allow(null).allow(''),
    isDeleted: joi.boolean(),
    _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of gaushal_details_master for filter documents from collection */
exports.findFilterKeys = joi.object({
    options: options,
    ...Object.fromEntries(
        keys.map(key => [key, joi.object({
            gaushala_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            cattle_count: joi.alternatives().try(joi.array().items(), joi.number().integer(), joi.object()),
            expense: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
            per_cattle_expense: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
            production: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
            stock: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
            date: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            isDeleted: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
            id: joi.any(),
            _id: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object())
        }).unknown(true),])
    ),
    isCountOnly: isCountOnly,
    populate: joi.array().items(populate),
    select: select

}).unknown(true);