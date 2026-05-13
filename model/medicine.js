/**
 * medicine.js
 * @description :: model of a database collection medicine
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
    gaushala_id: { type: String, required: true },
    medical_id: { type: Number, required: true },
    cowId: { type: String, required: true },
    vac_name: { type: String },
    dose: { type: Number },
    next_dose_time: { type: String },
    date: { type: String, required: true },
    remark: { type: String },
    gap_in_day: { type: Number, required: true },
    status: { type: String, required: true },
    added_by: { type: String },
    type: { type: String },
    to_date: { type: String },
    heat_attempt: { type: Number },
    medicines: [
      {
        item_id: { type: String },
        item_name: { type: String },
        count: { type: Number }
      }
    ],
    isDeleted: { type: Boolean },
    isActive: { type: Boolean },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    addedBy: { type: String },
    updatedBy: { type: String }
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
const medicine = mongoose.model('medicine', schema);
module.exports = medicine;