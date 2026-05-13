/**
 * user.js
 * @description :: model of a database collection user
 */

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
let idValidator = require('mongoose-id-validator');
const bcrypt = require('bcryptjs');
const { USER_TYPES } = require('../constants/authConstant');
const { convertObjectToEnum } = require('../utils/common');
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

    user_id: { type: String, unique: true },

    password: { type: String, required: true },

    gaushala_id: { type: String, required: true },

    isDeleted: { type: Boolean, default: false },

    isActive: { type: Boolean, default: true },

    createdAt: { type: Date },

    updatedAt: { type: Date },

    userType: {
      type: Number,
      enum: convertObjectToEnum(USER_TYPES),
      required: true
    },

    email: { type: String, default: '' },

    mobileNo: { type: String, default: '' },

    gaushala_list: { type: Array, default: [] },

    resetPasswordLink: {
      code: String,
      expireTime: Date,
      default: ''
    },

    loginRetryLimit: {
      type: Number,
      default: 0
    },

    loginReactiveTime: { type: Date }
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
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 8);
    console.log('password hashed = ', this.password);
  }
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

schema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};
schema.method('toJSON', function () {
  const {
    _id, __v, ...object
  } = this.toObject({ virtuals: true });
  object.id = _id;
  delete object.password;

  return object;
});
schema.plugin(mongoosePaginate);
schema.plugin(idValidator);
const user = mongoose.model('user', schema);
module.exports = user;