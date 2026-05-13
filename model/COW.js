/**
 * COW.js
 * @description :: model of a database collection COW
 */

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
let idValidator = require('mongoose-id-validator');
const authConstantEnum = require('../constants/authConstant');

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

    breed: { type: String },

    gaushala_id: { type: String },

    type: { type: String },

    shed_id: { type: String, default: '' },

    tag_id: { type: String, unique: true },

    dob: { type: String },

    calf_name: { type: String },

    isFemale: { type: Boolean },

    isDeleted: { type: Boolean },

    createdAt: { type: Date },

    updatedAt: { type: Date },

    addedBy: { type: String, default: '' },

    calf_weight: { type: Number, default: 0 },

    avatarUrl: { type: String, default: '' },

    dam_id: { type: String, default: '' },

    dam_name: { type: String, default: '' },

    sair_id: { type: String, default: '' },

    sair_name: { type: String, default: '' },

    delivery_time: { type: String, default: '' },

    send_died_date: { type: String, default: '' },

    purchase_date: { type: String, default: '' },

    remark: { type: String, default: '' }
  }
  , {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    }
  });
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
const COW = mongoose.model('COW', schema);
module.exports = COW;