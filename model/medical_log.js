/**
 * medical_log.js
 * @description :: model of a database collection medical_log
 */

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
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

        gaushala_id: { type: String },

        stockId: { type: String },

        medical_log_id: { type: Number },

        medical_id: { type: Number },

        item_id: { type: String },

        item_name: { type: String },

        medical_type: { type: String },

        date: { type: String },

        remark: { type: String },

        isDeleted: { type: Boolean },

        createdAt: { type: Date },

        updatedAt: { type: Date },

        addedBy: { type: String }
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
const medical_log = mongoose.model('medical_log', schema);
module.exports = medical_log;