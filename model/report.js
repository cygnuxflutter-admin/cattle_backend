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

    item_id: { type: String },

    gaushala_id: { type: String },

    item_type: { type: String },

    date: { type: String },

    item_add_in_month: { type: Number },

    item_out_in_month: { type: Number },

    item_amount_add_in_month: { type: Number },

    item_amount_out_in_month: { type: Number },

    opening_qty_of_item: { type: Number },

    closing_qty_of_item: { type: Number },

    average_price_of_item: { type: Number },

    opening_amount: { type: Number },

    closing_amount: { type: Number },

    isDeleted: { type: Boolean },

    isActive: { type: Boolean },

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
  this.isActive = true;
  next();
});

schema.pre('insertMany', async function (next, docs) {
  if (docs && docs.length) {
    for (let index = 0; index < docs.length; index++) {
      const element = docs[index];
      element.isDeleted = false;
      element.isActive = true;
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
const report = mongoose.model('report', schema);
module.exports = report;