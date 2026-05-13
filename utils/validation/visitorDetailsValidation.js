/**
 * visitorDetailsValidation.js
 * @description :: validate each post and put request as per visitorDetails model
 */

const joi = require('joi');
const {
    options, isCountOnly, populate, select
} = require('./commonFilterValidation');

/** validation keys and properties of visitorDetails */
exports.schemaKeys = joi.object({
    visitorName: joi.string().allow(null).allow(''),
    phoneNumber: joi.string().allow(null).allow(''),
    email: joi.string().allow(null).allow(''),
    birthDate: joi.string().allow(null).allow(''),
    anivarsaryDate: joi.string().allow(null).allow(''),
    visitDate: joi.string().allow(null).allow(''),
    isDeleted: joi.boolean(),
    isActive: joi.boolean()
}).unknown(true);

/** validation keys and properties of visitorDetails for updation */
exports.updateSchemaKeys = joi.object({
    visitorName: joi.string().allow(null).allow(''),
    phoneNumber: joi.string().allow(null).allow(''),
    email: joi.string().allow(null).allow(''),
    birthDate: joi.string().allow(null).allow(''),
    anivarsaryDate: joi.string().allow(null).allow(''),
    visitDate: joi.string().allow(null).allow(''),
    isDeleted: joi.boolean(),
    isActive: joi.boolean(),
    _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of visitorDetails for filter documents from collection */
exports.findFilterKeys = joi.object({
    options: options,
    ...Object.fromEntries(
        keys.map(key => [key, joi.object({
            visitorName: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            phoneNumber: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            email: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            birthDate: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            anivarsaryDate: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            visitDate: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
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
