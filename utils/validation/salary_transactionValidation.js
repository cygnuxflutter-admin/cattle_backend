/**
 * salary_transactionValidation.js
 * @description :: validate each post and put request as per salary_transaction model
 */

const joi = require('joi');
const {
    options, isCountOnly, populate, select
} = require('./commonFilterValidation');

/** validation keys and properties of salary_transaction */
exports.schemaKeys = joi.object({
    emp_id: joi.string().allow(null).allow(''),
    generated_date: joi.string().allow(null).allow(''),
    actual_pay_date: joi.string().allow(null).allow(''),
    payment_type: joi.string().allow(null).allow(''),
    pay_transaction_id: joi.string().allow(null).allow(''),
    isPaid: joi.boolean(),
}).unknown(true);

/** validation keys and properties of salary_transaction for updation */
exports.updateSchemaKeys = joi.object({
    emp_id: joi.string().allow(null).allow(''),
    salary_month: joi.string().allow(null).allow(''),
    total_working_days: joi.number().integer().allow(0),
    actual_working_days: joi.number().allow(0),
    leaves: joi.number().allow(0),
    decided_salary: joi.number().allow(0),
    payable_salary: joi.number().allow(0),
    generated_date: joi.string().allow(null).allow(''),
    generatedBy: joi.string().allow(null).allow(''),
    actual_pay_date: joi.string().allow(null).allow(''),
    payment_type: joi.string().allow(null).allow(''),
    pay_transaction_id: joi.string().allow(null).allow(''),
    isPaid: joi.boolean(),
    isDeleted: joi.boolean(),
    _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);

let keys = ['query', 'where'];
/** validation keys and properties of salary_transaction for filter documents from collection */
exports.findFilterKeys = joi.object({
    options: options,
    ...Object.fromEntries(
        keys.map(key => [key, joi.object({
            emp_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            salary_month: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            total_working_days: joi.alternatives().try(joi.array().items(), joi.number().integer(), joi.object()),
            actual_working_days: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
            leaves: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
            decided_salary: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
            payable_salary: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
            generated_date: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            generatedBy: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            actual_pay_date: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            payment_type: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            pay_transaction_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
            isPaid: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
            isDeleted: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
            id: joi.any(),
            _id: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object())
        }).unknown(true),])
    ),
    isCountOnly: isCountOnly,
    populate: joi.array().items(populate),
    select: select

}).unknown(true);


exports.findMonthWiseFilterKeys = joi.object({
    options: options,
    ...Object.fromEntries(
        keys.map(key => [key, joi.object({

            salary_month: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()).required(),
            id: joi.any(),
            _id: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object())
        }).unknown(true),])
    ),
    isCountOnly: isCountOnly,
    populate: joi.array().items(populate),
    select: select

}).unknown(true);