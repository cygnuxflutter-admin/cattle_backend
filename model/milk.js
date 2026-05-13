const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const idValidator = require('mongoose-id-validator');

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

const schema = new Schema({
  cow_tag_id: { type: String },
  liter: { type: Number },
  gaushala_id: { type: String },
  takenBy: { type: String },
  date: { type: String },
  day_time: { type: String },
  remark: { type: String },
  isDeleted: { type: Boolean },
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
  const { _id, __v, ...object } = this.toObject({ virtuals: true });
  object.id = _id;
  return object;
});

schema.plugin(mongoosePaginate);
schema.plugin(idValidator);

// Function to get the current financial year in the format YYYY-YYYY
function getCurrentFinancialYear() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const financialYear = month < 4 ? `${year - 1}-${year}` : `${year}-${year + 1}`;
  return financialYear;
}

// Create a function to dynamically create the collection based on the financial year
function createMilkCollection() {
  const currentYear = getCurrentFinancialYear();
  const collectionName = `milk_${currentYear}`;
  return mongoose.model(collectionName, schema);
}

const Milk = createMilkCollection(); // Initial collection based on current financial year
module.exports = Milk;