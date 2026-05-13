/**
 * stock.js
 * @description :: model of a database collection stock
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

    RFO_no: { type: String, default: '' },

    gaushala_id: { type: String, required: true },

    vendor_id: { type: String, required: true },

    bill_no: { type: String, default: '' },

    item_id: { type: String, required: true },

    expence_type: { type: String, required: true },

    // unit_type:{ type:String },
    cgst: { type: String, default: "0" },

    sgst: { type: String, default: "0" },

    qty: { type: String, default: '' },

    kg_per_unit: { type: Number, default: 0 },

    rate_per_unit: { type: Number, default: 0 },

    totalWtOrQty: { type: Number, default: 0 },

    total_amount: { type: Number, default: 0 },

    entry_by: { type: String, default: '' },

    remark: { type: String, default: '' },

    isStock: { type: Boolean, default: true },

    bill_date: { type: String, default: '' },

    date: { type: String, required: '' },

    bill_image: { type: Array, default: [] },

    createdAt: { type: Date },

    updatedAt: { type: Date },

    isDeleted: { type: Boolean }
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
const stock = mongoose.model('stock', schema);
module.exports = stock;