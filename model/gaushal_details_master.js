/**
 * gaushal_details_master.js
 * @description :: model of a database collection gaushal_details_master
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

        cattle_count: { type: Number },

        expense: { type: Number },

        per_cattle_expense: { type: Number },

        production: { type: Number },

        stock: { type: Number },

        date: { type: String },

        isDeleted: { type: Boolean },
        createdAt: { type: Date },

        updatedAt: { type: Date }
    },
    {
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
const gaushal_details_master = mongoose.model('gaushal_details_master', schema);
module.exports = gaushal_details_master;