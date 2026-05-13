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
    emp_id: { type: String, unique: true },
    gaushala_id: { type: String, default: '' },
    isEmpTemporary: { type: Boolean, default: false },
    payroll_name: { type: String, default: '' },
    joining_date: { type: String, default: '' },
    category: { type: String, default: '' },
    gender: { type: String, default: '' },
    adhar_name: { type: String, default: '' },
    parent_spouse_name: { type: String, default: '' },
    relationship: { type: String, default: '' },
    dob: { type: String, default: '' },
    adhar_number: { type: String, default: '' },
    pan_card: { type: String, default: '' },
    bank_account: { type: Number, default: 0 },
    bank_name: { type: String, default: '' },
    IFSC_code: { type: String, default: '' },
    mobile_number: { type: Number, default: 0 },
    UAN_no: { type: Number, default: 0 },
    remark: { type: String, default: '' },
    PF_no: { type: String, default: '' },
    ESI_no: { type: String, default: '' },
    salary: [
      {
        date: { type: String, default: '' },
        amountDecided: { type: Number, default: 0 },
      },
    ],
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
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
const employee = mongoose.model('employee', schema);
module.exports = employee;