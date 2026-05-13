/**
 * department.js
 * @description :: model of a database collection department
 */

const mongoose = require('mongoose');
const seriesService = require('../services/seriesService');
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

    department_id:{ type:String },

    gaushala_id:{ type:String },

    value:{ type:String },

    mobile_no:{ type:Number },

    email_id:{ type:String },

    isDeleted:{ type:Boolean }
  }
);
schema.pre('save', async function (next) {
  this.isDeleted = false;
  // this.department_id = await seriesService.getNextSequenceString('department','department_id');
  next();
});

schema.pre('insertMany', async function (next, docs) {
  if (docs && docs.length){
    for (let index = 0; index < docs.length; index++) {
      const element = docs[index];
      element.isDeleted = false;
      // element.department_id = await seriesService.getNextSequenceString('department','department_id');
    }
  }
  next();
});

schema.method('toJSON', function () {
  const {
    _id, __v, ...object 
  } = this.toObject({ virtuals:true });
  object.id = _id;
     
  return object;
});
schema.plugin(mongoosePaginate);
schema.plugin(idValidator);
const department = mongoose.model('department',schema);
module.exports = department;