/**
 * medical_logValidation.js
 * @description :: validate each post and put request as per medical_log model
 */

const joi = require('joi');
const {
    options, isCountOnly, populate, select
} = require('./commonFilterValidation');

/** validation keys and properties of medical_log */
exports.schemaKeys = joi.object({
    gaushala_id: joi.string().allow(null).allow(''),
    stockId: joi.string().allow(null).allow(''),
    medical_log_id: joi.number().integer().allow(0),
    medical_id: joi.number().integer().allow(0),
    item_id: joi.string().allow(null).allow(''),
    item_name: joi.string().allow(null).allow(''),
    medical_type: joi.string().allow(null).allow(''),
    date: joi.string().allow(null).allow(''),
    remark: joi.string().allow(null).allow(''),
    isDeleted: joi.boolean(),
    addedBy: joi.string().allow(null).allow('')
}).unknown(true);

/** validation keys and properties of medical_log for updation */
exports.updateSchemaKeys = joi.object({
    gaushala_id: joi.string().allow(null).allow(''),
    stockId: joi.string().allow(null).allow(''),
    medical_log_id: joi.number().integer().allow(0),
    medical_id: joi.number().integer().allow(0),
    item_id: joi.string().allow(null).allow(''),
    item_name: joi.string().allow(null).allow(''),
    medical_type: joi.string().allow(null).allow(''),
    date: joi.string().allow(null).allow(''),
    remark: joi.string().allow(null).allow(''),
    isDeleted: joi.boolean(),
    addedBy: joi.string().allow(null).allow(''),
    _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of medical_log for filter documents from collection */
exports.findFilterKeys = joi.object({
    options: options,
    ...Object.fromEntries(
        keys.map(key => [key, joi.object({
            gaushala_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            stockId: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            medical_log_id: joi.alternatives().try(joi.array().items(), joi.number().integer(), joi.object()),
            medical_id: joi.alternatives().try(joi.array().items(), joi.number().integer(), joi.object()),
            item_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            item_name: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            medical_type: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            date: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            remark: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            isDeleted: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
            addedBy: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            id: joi.any(),
            _id: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object())
        }).unknown(true),])
    ),
    isCountOnly: isCountOnly,
    populate: joi.array().items(populate),
    select: select

}).unknown(true);
