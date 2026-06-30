/**
 * medical_reminderValidation.js
 * @description :: validate each post and put request as per medical_reminder model
 */

const joi = require('joi');
const {
    options, isCountOnly, populate, select
} = require('./commonFilterValidation');

/** validation keys and properties of medical_reminder */
exports.schemaKeys = joi.object({
    gaushala_id: joi.string().allow(null).allow(''),
    cow_id: joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    tag_id: joi.string().required(),
    vaccine_name: joi.string().valid('deworming', 'lsd', 'fmd', 'brucellosis').required(),
    date: joi.string().required(),
    remark: joi.string().allow(null).allow(''),
    isDeleted: joi.boolean(),
    addedBy: joi.string().allow(null).allow('')
}).unknown(true);

/** validation keys and properties of medical_reminder for updation */
exports.updateSchemaKeys = joi.object({
    gaushala_id: joi.string().allow(null).allow(''),
    cow_id: joi.string().regex(/^[0-9a-fA-F]{24}$/),
    tag_id: joi.string(),
    vaccine_name: joi.string().valid('deworming', 'lsd', 'fmd', 'brucellosis'),
    date: joi.string(),
    remark: joi.string().allow(null).allow(''),
    isDeleted: joi.boolean(),
    addedBy: joi.string().allow(null).allow(''),
    _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of medical_reminder for filter documents from collection */
exports.findFilterKeys = joi.object({
    options: options,
    ...Object.fromEntries(
        keys.map(key => [key, joi.object({
            gaushala_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            cow_id: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object()),
            tag_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            vaccine_name: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
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
