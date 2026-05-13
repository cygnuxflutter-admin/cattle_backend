/**
 * db.js
 * @description :: exports database connection using mongoose
 */

const mongoose = require('mongoose');
const uri = process.env.NODE_ENV === 'test' ? process.env.DB_TEST_URL : process.env.DB_URL;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    autoIndex: false
}, (res) => {
    if (!res) {
        console.log(`MongoDB Connected..!`);
    } else {
        console.log(res)
        console.log(`MongoDB not Connected..!`);
    }
});

module.exports = mongoose;