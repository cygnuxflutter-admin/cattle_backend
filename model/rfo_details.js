/**
 * rfo_details.js
 * @description :: model of a database collection rfo_details
 */

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
let idValidator = require('mongoose-id-validator');
const { required } = require('joi');
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

        RFO_no: { type: String, required: true },

        gaushala_id: { type: String, required: true },

        rfo_type: { type: Number, required: true },

        paymentType: { type: Number, required: true },

        vendor_id: { type: String, required: true },

        vendorName: { type: String },

        sgst: { type: String },

        cgst: { type: String },

        date: { type: String, required: true },

        fromDate: { type: String, required: true },

        toDate: { type: String, required: true },

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
const rfo_details = mongoose.model('rfo_details', schema);
module.exports = rfo_details;