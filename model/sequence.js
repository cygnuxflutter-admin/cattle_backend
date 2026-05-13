/**
 * sequence.js
 * @description :: model of a database collection sequence
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

    modelName:{
      type:String,
      required:true 
    },

    attribute:{
      type:String ,
      required:true 
    },

    prefix:{
      type:String,
      default:'' 
    },

    suffix:{
      type:String ,
      default:'' 
    },

    startingPoint:{
      type:String,
      match:/^[0-9]+$/,
      required:true
    },

    totalEntry:{
      type:Number,
      default:0 
    },

    isActive:{ type:Boolean },

    createdAt:{ type:Date },

    updatedAt:{ type:Date },

    addedBy:{
      type:Schema.Types.ObjectId,
      ref:'user'
    },

    updatedBy:{
      type:Schema.Types.ObjectId,
      ref:'user'
    },

    isDeleted:{ type:Boolean }
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
  if (docs && docs.length){
    for (let index = 0; index < docs.length; index++) {
      const element = docs[index];
      element.isDeleted = false;
      element.isActive = true;
    }
  }
  next();
});
schema.index({
  'model':1,
  'attribute':1
},{
  unique:true,
  name:'Seq_model_attribute_unique'
});
schema.method('toJSON', function () {
  const {
    __v, ...object 
  } = this.toObject({ virtuals:true });
  object.id = object._id;
     
  return object;
});
schema.plugin(mongoosePaginate);
schema.plugin(idValidator);

const sequence = mongoose.model('sequence',schema,'sequence');
module.exports = sequence;