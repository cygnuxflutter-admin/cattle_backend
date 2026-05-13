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

    Code: { type: String, unique: true },

    Group: { type: String, required: true },

    Name: { type: String, required: true },

    Mobile_No: { type: Number, default: 0 },

    GST_Number: { type: String, default: '' },

    Pan_Number: { type: String, default: '' },

    Bank_Name: { type: String, default: '' },

    Account_Number: { type: String, default: '' },

    IFSC_Code: { type: String, default: '' },

    gaushala_id: { type: String, required: true },

    isDeleted: { type: Boolean, default: false },

    isActive: { type: Boolean, default: true },

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
const vendor = mongoose.model('vendor', schema);
module.exports = vendor;