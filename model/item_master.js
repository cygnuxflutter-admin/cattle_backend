/**
 * item_master.js
 * @description :: model of a database collection item_master
 */

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const AutoIncrement = require('mongoose-sequence')(mongoose);
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
    UnitType: { type: String },
    gaushala_id: { type: String },
    OutUnitType: { type: String },
    ExpenceType: { type: String },
    ItemId: { type: String },
    ItemName: { type: String },
    isStock: { type: Boolean },
    autoInfo: {
      isAutoGenerate: { type: Boolean },
      totalWtOrQty: { type: Number }
    },
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
const item_master = mongoose.model('item_master', schema);
module.exports = item_master;