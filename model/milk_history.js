/**
 * milk_history.js
 * @description :: model of a database collection milk_history
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

    day_time: { type: String },

    gaushala_id: { type: String },

    date: { type: String },

    morning_milk: { type: Number },

    evening_milk: { type: Number },

    milking_cows_morning: { type: Number },

    milking_cows_evening: { type: Number },

    total_milk: { type: Number },

    total_milking_cows: { type: String },

    // milkByCows: { type: String },

    totalGIRCows: { type: String },

    isDeleted: { type: Boolean },

    createdAt: { type: Date }
  }
  , { timestamps: { createdAt: 'createdAt', } }
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
const milk_history = mongoose.model('milk_history', schema);
module.exports = milk_history;