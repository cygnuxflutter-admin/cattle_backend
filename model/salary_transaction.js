const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { PAYMENT_TYPE } = require('../constants/authConstant');
const { convertObjectToEnum } = require('../utils/common');
let idValidator = require('mongoose-id-validator');
const myCustomLabels = {
    totalDocs: 'itemCount',
    docs: 'data',
    limit: 'perPage',
    page: 'currentPage',
    nextPage: 'next',
    prevPage: 'prev',
    totalPages: 'pageCount',
    pagingCounter: 'slNo',
    meta: 'paginator',
};
mongoosePaginate.paginate.options = { customLabels: myCustomLabels };
const Schema = mongoose.Schema;
const schema = new Schema(
    {

        emp_id: { type: String },

        gaushala_id: { type: String },

        salary_month: { type: String },

        total_working_days: { type: Number },

        actual_working_days: { type: Number },

        leaves: { type: Number, default: 0 },

        decided_salary: { type: Number },

        payable_salary: { type: Number },

        generated_date: { type: String },

        generatedBy: { type: String },

        actual_pay_date: { type: String, default: '' },

        payment_type: {
            type: String,
            enum: convertObjectToEnum(PAYMENT_TYPE),
            default: PAYMENT_TYPE.CASH
        },

        pay_transaction_id: { type: String },

        isPaid: { type: Boolean, default: false },

        isDeleted: { type: Boolean },

        createdAt: { type: Date },

        updatedAt: { type: Date }
    }
    , {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    }
);
schema.pre('save', async function (next) {
    this.isDeleted = false;
    next();
});

schema.pre('insertMany', async function (next, docs) {
    if (docs && docs.length) {
        for (let index = 0; index < docs.length; index++) {
            const element = docs[index];
            element.isDeleted = false;
        }
    }
    next();
});

schema.method('toJSON', function () {
    const {
        _id, __v, ...object
    } = this.toObject({ virtuals: true });
    object.id = _id;

    return object;
});
schema.plugin(mongoosePaginate);
schema.plugin(idValidator);
const salary_transaction = mongoose.model('salary_transaction', schema);
module.exports = salary_transaction;