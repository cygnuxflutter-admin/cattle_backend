/**
 * sales_transaction.js
 * @description :: model of a database collection sales_transaction
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

    department_id: { type: String },

    department_name: { type: String },

    item_name: { type: String },

    qty: { type: Number },

    rate: { type: Number },

    total: { type: Number },

    mobile_number: { type: String },

    email: { type: String },

    vehicle_number: { type: String },

    driver_name: { type: String },

    location: { type: String },

    date: { type: String },

    sleep_number: { type: Number },

    time: { type: String },

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
const sales_transaction = mongoose.model('sales_transaction', schema);
module.exports = sales_transaction;