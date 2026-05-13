/**
 * common.js
 * @description: exports helper methods for project.
 */

const mongoose = require('mongoose');
const UserRole = require('../model/userRole');
const RouteRole = require('../model/routeRole');
const dbService = require('./dbService');
const { func } = require('joi');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const configureAWS = require('../config/awsConfig'); // Import the AWS configuration 

/**
 * convertObjectToEnum : converts object to enum
 * @param {Object} obj : object to be converted
 * @return {Array} : converted Array
 */
function convertObjectToEnum(obj) {
  const enumArr = [];
  Object.values(obj).map((val) => enumArr.push(val));
  return enumArr;
}

/**
 * randomNumber : generate random numbers for given length
 * @param {number} length : length of random number to be generated (default 4)
 * @return {number} : generated random number
 */
function randomNumber(length = 4) {
  const numbers = '12345678901234567890';
  let result = '';
  for (let i = length; i > 0; i -= 1) {
    result += numbers[Math.round(Math.random() * (numbers.length - 1))];
  }
  return result;
};

/**
 * replaceAll: find and replace all occurrence of a string in a searched string
 * @param {string} string  : string to be replace
 * @param {string} search  : string which you want to replace
 * @param {string} replace : string with which you want to replace a string
 * @return {string} : replaced new string
 */
function replaceAll(string, search, replace) {
  return string.split(search).join(replace);
}

/**
 * uniqueValidation: check unique validation while user registration
 * @param {Object} model : mongoose model instance of collection
 * @param {Object} data : data, coming from request
 * @return {boolean} : validation status
 */
async function uniqueValidation(Model, data) {
  let filter = {};
  if (data && data['user_id']) {
    filter = { 'user_id': data['user_id'] };
  }
  filter.isActive = true;
  filter.isDeleted = false;
  let found = await dbService.findOne(Model, filter);
  if (found) {
    return false;
  }
  return true;
}

/**
 * getDifferenceOfTwoDatesInTime : get difference between two dates in time
 * @param {date} currentDate  : current date
 * @param {date} toDate  : future date
 * @return {string} : difference of two date in time
 */
function getDifferenceOfTwoDatesInTime(currentDate, toDate) {
  let hours = toDate.diff(currentDate, 'hour');
  currentDate = currentDate.add(hours, 'hour');
  let minutes = toDate.diff(currentDate, 'minute');
  currentDate = currentDate.add(minutes, 'minute');
  let seconds = toDate.diff(currentDate, 'second');
  currentDate = currentDate.add(seconds, 'second');
  if (hours) {
    return `${hours} hour, ${minutes} minute and ${seconds} second`;
  }
  return `${minutes} minute and ${seconds} second`;
}

/** 
 * getRoleAccessData: returns role access of User
 * @param {objectId} userId : id of user to find role data
 * @return {Object} : role access for APIs of model
 */
async function getRoleAccessData(userId) {
  let userRole = await dbService.findMany(UserRole, { userId: userId }, { pagination: false });
  let routeRole = await dbService.findMany(RouteRole, { roleId: { $in: userRole.data ? userRole.data.map(u => u.roleId) : [] } }, {
    pagination: false,
    populate: ['roleId', 'routeId']
  });
  let models = mongoose.modelNames();
  let Roles = routeRole.data ? routeRole.data.map(rr => rr.roleId && rr.roleId.name).filter((value, index, self) => self.indexOf(value) === index) : [];
  let roleAccess = {};
  if (Roles.length) {
    Roles.map(role => {
      roleAccess[role] = {};
      models.forEach(model => {
        if (routeRole.data && routeRole.data.length) {
          routeRole.data.map(rr => {
            if (rr.routeId && rr.routeId.uri.includes(`/${model.toLowerCase()}/`) && rr.roleId && rr.roleId.name === role) {
              if (!roleAccess[role][model]) {
                roleAccess[role][model] = [];
              }
              if (rr.routeId.uri.includes('create') && !roleAccess[role][model].includes('C')) {
                roleAccess[role][model].push('C');
              }
              else if (rr.routeId.uri.includes('list') && !roleAccess[role][model].includes('R')) {
                roleAccess[role][model].push('R');
              }
              else if (rr.routeId.uri.includes('update') && !roleAccess[role][model].includes('U')) {
                roleAccess[role][model].push('U');
              }
              else if (rr.routeId.uri.includes('delete') && !roleAccess[role][model].includes('D')) {
                roleAccess[role][model].push('D');
              }
            }
          });
        }
      });
    });
  }
  return roleAccess;
}

/**
 * getSelectObject : to return a object of select from string, array
 * @param {string || array || object} select : selection attributes
 * @returns {object} : object of select to be passed with filter
 */
function getSelectObject(select) {
  let selectArray = [];
  if (typeof select === 'string') {
    selectArray = select.split(' ');
  } else if (Array.isArray(select)) {
    selectArray = select;
  } else if (typeof select === 'object') {
    return select;
  }
  let selectObject = {};
  if (selectArray.length) {
    for (let index = 0; index < selectArray.length; index += 1) {
      const element = selectArray[index];
      if (element.startsWith('-')) {
        Object.assign(selectObject, { [element.substring(1)]: -1 });
      } else {
        Object.assign(selectObject, { [element]: 1 });
      }
    }
  }
  return selectObject;
}

/**
 * checkUniqueFieldsInDatabase: check unique fields in database for insert or update operation.
 * @param {Object} model : mongoose model instance of collection
 * @param {Array} fieldsToCheck : array of fields to check in database.
 * @param {Object} data : data to insert or update.
 * @param {String} operation : operation identification.
 * @param {Object} filter : filter for query.
 * @return {Object} : information about duplicate fields.
 */
const checkUniqueFieldsInDatabase = async (model, fieldsToCheck, data, operation, filter = {}) => {
  switch (operation) {
    case 'INSERT':
      for (const field of fieldsToCheck) {
        //Add unique field and it's value in filter.
        let query = {
          ...filter,
          [field]: data[field]
        };
        let found = await dbService.findOne(model, query);
        if (found) {
          return {
            isDuplicate: true,
            field: field,
            value: data[field]
          };
        }
      }
      break;
    case 'BULK_INSERT':
      for (const dataToCheck of data) {
        for (const field of fieldsToCheck) {
          //Add unique field and it's value in filter.
          let query = {
            ...filter,
            [field]: dataToCheck[field]
          };
          let found = await dbService.findOne(model, query);
          if (found) {
            return {
              isDuplicate: true,
              field: field,
              value: dataToCheck[field]
            };
          }
        }
      }
      break;
    case 'UPDATE':
    case 'BULK_UPDATE':
      let existData = await dbService.findMany(model, filter, { select: ['_id'] });
      for (const field of fieldsToCheck) {
        if (Object.keys(data).includes(field)) {
          if (existData && existData.length > 1) {
            return {
              isDuplicate: true,
              field: field,
              value: data[field]
            };
          } else if (existData && existData.length === 1) {
            let found = await dbService.findOne(model, { [field]: data[field] });
            if (found && (existData[0]._id.toJSON() !== found._id.toJSON())) {
              return {
                isDuplicate: true,
                field: field,
                value: data[field]
              };
            }
          }
        }
      }
      break;
    default:
      return { isDuplicate: false };
      break;
  }
  return { isDuplicate: false };
};

// Function to parse the date from the database string
function parseDatabaseDate(databaseDateString) {
  const [datePart] = databaseDateString.split(' ');
  const [day, month, year] = datePart.split('/').map(Number);

  const parsedDate = new Date(year, month - 1, day);
  return parsedDate;
}

// is today date
function isToday(dateString) {
  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date)) {
    // Invalid Date, handle the situation here
    return false;
  }

  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// is within last 7 day
function isWithinLast7Days(dateString) {
  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date)) {
    // Invalid Date, handle the situation here
    return false;
  }

  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); // Subtract 7 days from today

  return date >= sevenDaysAgo && date <= today;
}

function isLatestDate(dateToCheck, isAlreadyUtc, listOfDates) {
  // Ensure dateToCheck and listOfDates are defined
  if (!dateToCheck || !listOfDates || listOfDates.length === 0) {
    return false;
  }

  let parsedDateToCheck = '';
  let parsedDate = '';
  // Parse the date to 
  // console.log(isAlreadyUtc);
  if (isAlreadyUtc === true) {
    parsedDateToCheck = dateToCheck;
  } else {
    parsedDateToCheck = parseDatabaseDate(dateToCheck);
  }


  // Find the latest date from the list
  let latestDate = null;
  for (const date of listOfDates) {
    if (date != undefined) {

      if (isAlreadyUtc === true) {
        parsedDate = date;
      } else {
        parsedDate = parseDatabaseDate(date);
      }
      if (!latestDate || parsedDate > latestDate) {
        latestDate = parsedDate;
      }
    }
  }

  // Compare the parsed date to the latest date
  return parsedDateToCheck.getTime() === latestDate.getTime();
}

function isBeforeLatestDatess(latestDate, isAlreadyUtc, dateToCheck) {
  // Ensure dateToCheck and latestDate are defined
  if (!dateToCheck || !latestDate) {
    return false;
  }

  let parsedDateToCheck = '';

  if (isAlreadyUtc === true) {
    parsedDateToCheck = new Date(dateToCheck);
  } else {
    parsedDateToCheck = new Date(parseDatabaseDate(dateToCheck));
  }

  // Extract the year, month, and day components from both dates
  const parsedDateYear = parsedDateToCheck.getUTCFullYear();
  const parsedDateMonth = parsedDateToCheck.getUTCMonth();
  const parsedDateDay = parsedDateToCheck.getUTCDate();

  const latest = new Date(latestDate);
  const latestYear = latest.getUTCFullYear();
  const latestMonth = latest.getUTCMonth();
  const latestDay = latest.getUTCDate();

  // Compare the year, month, and day components
  if (
    parsedDateYear > latestYear ||
    (parsedDateYear === latestYear && parsedDateMonth > latestMonth) ||
    (parsedDateYear === latestYear && parsedDateMonth === latestMonth && parsedDateDay > latestDay)
  ) {
    return true;
  }

  return false;
}

function parseTagIds(tag_ids) {
  if (typeof tag_ids === 'string') {
    // Split the string by commas and trim whitespace
    return tag_ids.split(',').map((tag_id) => tag_id.trim());
  } else if (Array.isArray(tag_ids)) {
    // If it's already an array, ensure all items are strings
    console.log("-------->>>>>>>>");

    return tag_ids.map((tag_id) => String(tag_id));
  }
  // If it's not a string or an array, return an empty array or handle it as needed
  console.log(tag_ids);
  return [];
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  const todayDate = `${year}-${month}-${day}`;

  return todayDate;
}

function getDateBeforeLastSevenDays() {
  // Get the current date
  const currentDate = new Date();

  // Calculate the date seven days ago
  const sevenDaysAgo = new Date(currentDate);
  sevenDaysAgo.setDate(currentDate.getDate() - 6);

  // Format the result as a string in the desired format (e.g., YYYY-MM-DD)
  const formattedDate = sevenDaysAgo.toISOString().split('T')[0];

  return formattedDate;
}

function subtractOneMonth(month, year) {
  // Create a Date object for the given month and year
  const currentDate = new Date(year, month - 1, 1);

  // Subtract one month
  currentDate.setMonth(currentDate.getMonth() - 1);

  // Get the new month and year
  const newMonth = currentDate.getMonth() + 1; // Add 1 since months are zero-based
  const newYear = currentDate.getFullYear();

  return { newMonth, newYear };
}

function addZeroInMonth(month) {
  let tempMonth = month.toString();

  if (tempMonth.length == 1) {
    month = `0${month}`
  }
  return month;
}



const saveImagesLocally = (files, customFolderName) => {
  const uploadDirectory = `./uploads/${customFolderName}`;

  // Ensure the directory exists or create it
  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
  }

  const filePaths = [];
  files.forEach((file, index) => {
    const originalFileName = path.basename(file.originalname).replace(/\s+/g, '');
    const timestamp = Date.now();
    const destinationPath = path.join(uploadDirectory, `${timestamp}_${index + 1}_${originalFileName}`);
    fs.writeFileSync(destinationPath, file.buffer);
    filePaths.push(destinationPath.replace(/\\/g, '/')); // Use forward slashes for consistency
  });

  return filePaths;
};

function deleteLocalImages(filePaths) {
  filePaths.forEach((filePath) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting local file:', err);
      } else {
        console.log('Local image deleted:', filePath);
      }
    });
  });
}

const uploadImagesToS3 = async (filePaths, folderName) => {
  // Configure AWS using the function from awsConfig.js
  configureAWS();

  const s3 = new AWS.S3();
  const uploadedFileUrls = [];

  for (let index = 0; index < filePaths.length; index++) {
    const filePath = filePaths[index];
    const fileContent = fs.readFileSync(filePath);

    const originalFileName = path.basename(filePath).replace(/\s+/g, '');
    const timestamp = Date.now();
    const formattedFileName = `${process.env.NODE_ENV === 'test' ? 'Test' : 'Live'} ${timestamp}_${index + 1}_${originalFileName}`;

    // Determine content type based on file extension
    const fileExtension = path.extname(originalFileName).toLowerCase();
    let contentType = 'application/octet-stream'; // default content type
    if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (fileExtension === '.png') {
      contentType = 'image/png';
    }

    const params = {
      Bucket: process.env.BUCKET_NAME,
      // Key: `cowsdata/${folderName}/uploaded-image-${index + 1}.jpg`, // Customize the file name
      Key: `${folderName}/${formattedFileName}`, // Customize the file name
      Body: fileContent,
      ContentType: contentType, // Change the content type as needed
      // ACL: 'public-read',
    };

    try {
      const data = await s3.upload(params).promise();
      console.log(`Image ${index + 1} uploaded to S3:`, data.Location);
      uploadedFileUrls.push(data.Location);
    } catch (error) {
      console.error(`Error uploading image ${index + 1} to S3:`, error);
    }
  }

  return uploadedFileUrls;
};

const convertToDouble = (value) => {
  if (value === null || value === undefined || value === '') {
    return 0.0; // Set a default value for null or blank cases
  }

  // Check if the value is an integer and convert it to double with a '.0' suffix
  if (Number.isInteger(value)) {

    let flotVal = parseFloat(value);
    let result = flotVal.toFixed(2);

    return parseFloat(result);
  }

  return parseFloat(value); // Convert to double
};

function getFirstAndLastDateOfMonth(year, month) {
  // Month is 0-based in JavaScript Date objects, so subtract 1 from the user-input month
  const firstDate = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0); // Setting day to 0 gives the last day of the previous month

  // Format the dates as 'YYYY-MM-DD'
  const startDate = `${firstDate.getFullYear()}-${(firstDate.getMonth() + 1).toString().padStart(2, '0')}-${firstDate.getDate().toString().padStart(2, '0')}`;
  const endDate = `${lastDate.getFullYear()}-${(lastDate.getMonth() + 1).toString().padStart(2, '0')}-${lastDate.getDate().toString().padStart(2, '0')}`;

  return { startDate, endDate };
}

function getDaysInMonth(dateString) {
  const date = new Date(dateString);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getDaysDifference(dateToCheckStr, fromDateStr, toDateStr) {
  // Parse input dates
  const [day, month, year] = dateToCheckStr.split('-');

  dateToCheckStr = `${year}-${month}-${day}`

  const dateToCheck = new Date(dateToCheckStr);
  const fromDate = new Date(fromDateStr);
  const toDate = new Date(toDateStr);

  // Check if the dateToCheck is between fromDate and toDate
  if (dateToCheck >= fromDate && dateToCheck <= toDate) {
    // Calculate the difference in milliseconds and convert to days
    const timeDifference = toDate - dateToCheck;
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return daysDifference;
  } else {
    return null; // Date is not within the range
  }
}

const addDaysToDate = (inputDate, daysToAdd) => {
  // Convert the input date string to a Date object
  const date = new Date(inputDate);

  // Add the specified number of days
  date.setDate(date.getDate() + daysToAdd);

  // Format the result in 'YYYY-MM-DD' format
  const formattedResult = date.toISOString().split('T')[0];

  return formattedResult;
};

function isBlank(str) {
  return /^\s*$/.test(str);
}

function isValidDateFormat(dateString) {
  // Regular expression to match the format "YYYY-MM-DD"
  const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

  // Check if the provided date string matches the expected format
  return dateFormatRegex.test(dateString);
}

module.exports = {
  isValidDateFormat,
  isBlank,
  addDaysToDate,
  getDaysDifference,
  getDaysInMonth,
  getFirstAndLastDateOfMonth,
  convertToDouble,
  deleteLocalImages,
  uploadImagesToS3,
  saveImagesLocally,
  addZeroInMonth,
  subtractOneMonth,
  getDateBeforeLastSevenDays,
  getTodayDate,
  parseTagIds,
  isBeforeLatestDatess,
  parseDatabaseDate,
  isToday,
  isWithinLast7Days,
  isLatestDate,
  convertObjectToEnum,
  randomNumber,
  replaceAll,
  uniqueValidation,
  getDifferenceOfTwoDatesInTime,
  getRoleAccessData,
  getSelectObject,
  checkUniqueFieldsInDatabase
};