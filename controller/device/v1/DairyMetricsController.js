
const DairyMetrics = require('../../../model/DairyMetrics');
const Milk = require('../../../model/milk');
const MilkUsage = require('../../../model/milk_usage');
const Stock = require('../../../model/stock');

const DairyMetricsSchemaKey = require('../../../utils/validation/DairyMetricsValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const { REMINDER_ACTIONS } = require('../../../constants/authConstant');
const moment = require('moment');
const { isToday, parseDatabaseDate, isLatestDate, isBeforeLatestDatess, getTodayDate, getDateBeforeLastSevenDays } = require('../../../utils/common');

const cron = require('node-cron');
const axios = require('axios');
const COW = require('../../../model/COW');
const milk_history = require('../../../model/milk_history');
const stock = require('../../../model/stock');
const { createAllReport } = require('./reportController');
const medicineController = require('./medicineController');
const { AppSync } = require('aws-sdk');

const addDairyMetrics = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      DairyMetricsSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    dataToCreate.gaushala_id = req.user.gaushala_id

    dataToCreate = new DairyMetrics(dataToCreate);
    let createdDairyMetrics = await dbService.create(DairyMetrics, dataToCreate);
    return res.success({ data: createdDairyMetrics });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find all documents of DairyMetrics from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found DairyMetrics(s). {status, message, data}
 */
const findAllDairyMetrics = async (req, res) => {
  try {
    let options = {};
    let query = {};
    query.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      DairyMetricsSchemaKey.findFilterKeys,
      DairyMetrics.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
    if (req.body.isCountOnly) {
      let totalRecords = await dbService.count(DairyMetrics, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundDairyMetricss = await dbService.paginate(DairyMetrics, query, options);
    if (!foundDairyMetricss || !foundDairyMetricss.data || !foundDairyMetricss.data.length) {
      return res.recordNotFound();
    }
    return res.success({ data: foundDairyMetricss });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find document of DairyMetrics from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found DairyMetrics. {status, message, data}
 */
const getDairyMetrics = async (req, res) => {
  try {
    let query = {};
    query.gaushala_id = req.user.gaushala_id;
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message: 'invalid objectId.' });
    }
    query._id = req.params.id;
    let options = {};
    let foundDairyMetrics = await dbService.findOne(DairyMetrics, query, options);
    if (!foundDairyMetrics) {
      return res.recordNotFound();
    }
    return res.success({ data: foundDairyMetrics });
  }
  catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : returns total number of documents of DairyMetrics.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getDairyMetricsCount = async (req, res) => {
  try {
    let where = {};
    where.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      DairyMetricsSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedDairyMetrics = await dbService.count(DairyMetrics, where);
    return res.success({ data: { count: countedDairyMetrics } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update document of DairyMetrics with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated DairyMetrics.
 * @return {Object} : updated DairyMetrics. {status, message, data}
 */
const updateDairyMetrics = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      DairyMetricsSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedDairyMetrics = await dbService.updateOne(DairyMetrics, query, dataToUpdate);
    if (!updatedDairyMetrics) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedDairyMetrics });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : partially update document of DairyMetrics with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated DairyMetrics.
 * @return {obj} : updated DairyMetrics. {status, message, data}
 */
const partialUpdateDairyMetrics = async (req, res) => {
  try {
    if (!req.params.id) {
      res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      DairyMetricsSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedDairyMetrics = await dbService.updateOne(DairyMetrics, query, dataToUpdate);
    if (!updatedDairyMetrics) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedDairyMetrics });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const cronForDashboard = async (req, res) => {

  //Milking Cron
  const todayDate = getTodayDate();

  const gaushala_list = ['01', '2'];

  for (let i = 0; i < gaushala_list.length; i++) {

    const allMilkingCows = await dbService.findAll(COW, { type: ['Milking', 'Milking-Pregnant'], isFemale: true, gaushala_id: gaushala_list[i] });
    const allMilkingGirCows = await dbService.findAll(COW, { type: ['Milking', 'Milking-Pregnant'], isFemale: true, breed: "GIR", gaushala_id: gaushala_list[i] });
    const cowCounts = allMilkingCows.length;

    let todayMorningMilkCount = 0;
    let todayEveningMilkCount = 0;

    let todayMorningCow = 0;
    let todayEveningCow = 0;

    let query = {};
    query.date = todayDate;
    query.gaushala_id = gaushala_list[i]
    const pipeline = [
      {
        $match: query,
      },
      {
        $group: {
          _id: '$day_time',
          totalLiter: { $sum: '$liter' },
          uniqueCowTagIds: { $addToSet: '$cow_tag_id' },
        },
      },
      {
        $addFields: {
          countUniqueCowTagIds: { $size: '$uniqueCowTagIds' },
        },
      },
      {
        $project: {
          // _id: 0, // Exclude _id from the result
          uniqueCowTagIds: 0, // Exclude the uniqueCowTagIds array
        },
      },
    ];

    const todatMilkData = await Milk.aggregate(pipeline);

    if (todatMilkData.length > 0) {
      for (let i = 0; i < todatMilkData.length; i++) {

        if (todatMilkData[i]._id === 'morning') {
          todayMorningMilkCount = todatMilkData[i].totalLiter;
          todayMorningCow = todatMilkData[i].countUniqueCowTagIds;
        } else {
          todayEveningMilkCount = todatMilkData[i].totalLiter;
          todayEveningCow = todatMilkData[i].countUniqueCowTagIds
        }

      }
    }

    let finalObj = {
      "morning_milk": todayMorningMilkCount,
      "evening_milk": todayEveningMilkCount,
      "milking_cows_morning": todayMorningCow,
      "milking_cows_evening": todayEveningCow,
      "date": todayDate,
      "total_milk": todayMorningMilkCount + todayEveningMilkCount,
      "total_milking_cows": cowCounts,
      "gaushala_id": gaushala_list[i],
      "totalGIRCows": allMilkingGirCows.length
    }

    const alreadyDataCreated = await dbService.findAll(milk_history, { date: getTodayDate(), gaushala_id: gaushala_list[i] });

    if (alreadyDataCreated.length == 0) {
      finalObj = new milk_history(finalObj);
      await dbService.create(milk_history, finalObj);
    } else {
      await dbService.updateOne(milk_history, { date: getTodayDate(), gaushala_id: gaushala_list[i] }, finalObj);
    }

  }

  return;

  // const currentDate = moment().startOf('day').toDate();
  // // Set the time to the end of the day
  // const endDate = moment().endOf('day').toDate();

  // const all_milk = await stock.find({
  //   createdAt: {
  //     $gte: currentDate,
  //     $lte: endDate
  //   }
  // })

  // return res.success({ data: {all_milk } });





  // return res.success({ data: { morningMilkCalculation, eveningMilkCalculation } });

};

// update cron for live update in last7day data
async function updateSevenDayMilkData(gaushala_id) {

  const todayDate = getTodayDate();

  const allMilkingCows = await dbService.findAll(COW, { type: ['Milking', 'Milking-Pregnant'], isFemale: true, gaushala_id: gaushala_id });
  const allMilkingGirCows = await dbService.findAll(COW, { type: ['Milking', 'Milking-Pregnant'], isFemale: true, breed: "GIR", gaushala_id: gaushala_id });
  const cowCounts = allMilkingCows.length;

  let todayMorningMilkCount = 0;
  let todayEveningMilkCount = 0;

  let todayMorningCow = 0;
  let todayEveningCow = 0;

  let query = {};
  query.date = todayDate;
  query.gaushala_id = gaushala_id
  const pipeline = [
    {
      $match: query,
    },
    {
      $group: {
        _id: '$day_time',
        totalLiter: { $sum: '$liter' },
        uniqueCowTagIds: { $addToSet: '$cow_tag_id' },
      },
    },
    {
      $addFields: {
        countUniqueCowTagIds: { $size: '$uniqueCowTagIds' },
      },
    },
    {
      $project: {
        // _id: 0, // Exclude _id from the result
        uniqueCowTagIds: 0, // Exclude the uniqueCowTagIds array
      },
    },
  ];

  const todatMilkData = await Milk.aggregate(pipeline);

  if (todatMilkData.length > 0) {
    for (let i = 0; i < todatMilkData.length; i++) {

      if (todatMilkData[i]._id === 'morning') {
        todayMorningMilkCount = todatMilkData[i].totalLiter;
        todayMorningCow = todatMilkData[i].countUniqueCowTagIds;
      } else {
        todayEveningMilkCount = todatMilkData[i].totalLiter;
        todayEveningCow = todatMilkData[i].countUniqueCowTagIds
      }

    }
  }

  let finalObj = {
    "morning_milk": todayMorningMilkCount,
    "evening_milk": todayEveningMilkCount,
    "milking_cows_morning": todayMorningCow,
    "milking_cows_evening": todayEveningCow,
    "date": todayDate,
    "total_milk": todayMorningMilkCount + todayEveningMilkCount,
    "total_milking_cows": cowCounts,
    "gaushala_id": gaushala_id,
    "totalGIRCows": allMilkingGirCows.length
  }

  const alreadyDataCreated = await dbService.findAll(milk_history, { date: todayDate, gaushala_id: gaushala_id });

  if (alreadyDataCreated.length == 0) {
    finalObj = new milk_history(finalObj);
    await dbService.create(milk_history, finalObj);
  } else {
    await dbService.updateOne(milk_history, { date: todayDate, gaushala_id: gaushala_id }, finalObj);
  }
  return;
}

const updateHistory = async (req, res) => {
  try {

    //const todayDate = req.body.data[0].date;

    // const gaushala_list = ['02'];
    const gaushala_id = req.user.gaushala_id;
    // const gaushala_id = '02';

    const dataArray = req.body.data;
    const uniqueDates = new Set(dataArray.map(item => item.date));
    const dates = Array.from(uniqueDates)
    // const dates = ['2024-04-01', '2024-04-02', '2024-04-03', '2024-04-04', '2024-04-05', '2024-04-06', '2024-04-07']

    for (let i = 0; i < dates.length; i++) {
      const todayDate = dates[i];

      const allMilkingCows = await dbService.findAll(COW, { type: ['Milking', 'Milking-Pregnant'], isFemale: true, gaushala_id: gaushala_id });
      const allMilkingGirCows = await dbService.findAll(COW, { type: ['Milking', 'Milking-Pregnant'], isFemale: true, breed: "GIR", gaushala_id: gaushala_id });
      const cowCounts = allMilkingCows.length;

      let todayMorningMilkCount = 0;
      let todayEveningMilkCount = 0;

      let todayMorningCow = 0;
      let todayEveningCow = 0;

      let query = {};
      query.date = todayDate;
      query.gaushala_id = gaushala_id
      const pipeline = [
        {
          $match: query,
        },
        {
          $group: {
            _id: '$day_time',
            totalLiter: { $sum: '$liter' },
            uniqueCowTagIds: { $addToSet: '$cow_tag_id' },
          },
        },
        {
          $addFields: {
            countUniqueCowTagIds: { $size: '$uniqueCowTagIds' },
          },
        },
        {
          $project: {
            // _id: 0, // Exclude _id from the result
            uniqueCowTagIds: 0, // Exclude the uniqueCowTagIds array
          },
        },
      ];

      const todatMilkData = await Milk.aggregate(pipeline);

      if (todatMilkData.length > 0) {
        for (let i = 0; i < todatMilkData.length; i++) {

          if (todatMilkData[i]._id === 'morning') {
            todayMorningMilkCount = todatMilkData[i].totalLiter;
            todayMorningCow = todatMilkData[i].countUniqueCowTagIds;
          } else {
            todayEveningMilkCount = todatMilkData[i].totalLiter;
            todayEveningCow = todatMilkData[i].countUniqueCowTagIds
          }

        }
      }

      let finalObj = {
        "morning_milk": todayMorningMilkCount,
        "evening_milk": todayEveningMilkCount,
        "milking_cows_morning": todayMorningCow,
        "milking_cows_evening": todayEveningCow,
        "date": todayDate,
        "total_milk": todayMorningMilkCount + todayEveningMilkCount,
        "total_milking_cows": cowCounts,
        "gaushala_id": gaushala_id,
        "totalGIRCows": allMilkingGirCows.length
      }

      const alreadyDataCreated = await dbService.findAll(milk_history, { date: todayDate, gaushala_id: gaushala_id });

      if (alreadyDataCreated.length == 0) {
        finalObj = new milk_history(finalObj);
        await dbService.create(milk_history, finalObj);
      } else {
        await dbService.updateOne(milk_history, { date: todayDate, gaushala_id: gaushala_id }, finalObj);
      }

      console.log(`Updated data for date: ${todayDate}`, finalObj);

    }

  } catch (error) {
    console.log(error);
    // return res.internalServerError({ message: error.message });
  }
}

const getReminders = async (req, res) => {
  try {
    let resultArray = [];
    console.log("getReminders called for gaushala_id:", req.user.gaushala_id);

    // Get the pending medications
    const pendingMedications = await medicineController.getMedicineList(req.user.gaushala_id);
    const pendingMedicationsCount = pendingMedications.length;
    resultArray.push(createObj(`${pendingMedicationsCount}`, REMINDER_ACTIONS.VACCINE));
    const pendingMedicationsObj = createObj(`${pendingMedicationsCount}`, REMINDER_ACTIONS.VACCINE)

    // Get the pending milking cows
    const pendingMilkingCows = await getPendingMilkingCows(req.user.gaushala_id);
    const morningPendingCows = pendingMilkingCows.morning.length;
    const eveningPendingCows = pendingMilkingCows.evening.length;
    resultArray.push(createObj(`${morningPendingCows}-${eveningPendingCows}`, REMINDER_ACTIONS.MILK));
    const getPendingMilkingCowsObj = createObj(`${morningPendingCows}-${eveningPendingCows}`, REMINDER_ACTIONS.MILK)

    // Check for stock out entry
    const stockOut = await dbService.findAll(Stock, { gaushala_id: req.user.gaushala_id, date: getTodayDate(), vendor_id: req.user.gaushala_id });

    let stockOutObj = createObj('', REMINDER_ACTIONS.STOCK)
    if (stockOut.length === 0) {
      resultArray.push(createObj('Please check stock out', REMINDER_ACTIONS.STOCK));
      stockOutObj = createObj('Please check stock out', REMINDER_ACTIONS.STOCK)
    }

    return res.success({ data: { pendingMedicationsObj, getPendingMilkingCowsObj, stockOutObj } });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
}

function createObj(content, action) {
  try {
    let obj = {};
    obj.content = content;
    obj.action = action;

    // Extract the number from the content string
    const match = content.match(/\d+/);
    const number = match ? match[0] : ''; // Check if a number is found, otherwise default to empty string

    let numberColor = ''; // Default color
    if (action === 3) {
      numberColor = 'AF2655'; // Color for action 3
    } else if (action === 1) {
      numberColor = '0766AD'; // Color for action 1
    } else {
      numberColor = '000000'; // Default color if action is not recognized
    }

    // Replace the number with itself wrapped in a span with customized color, size, and boldness
    const highlightedContent = content.replace(number, `<span style="color: #${numberColor}; font-size: larger; font-weight: bold;">${number}</span>`);

    // HTML content with the number highlighted with customized color, size, and boldness
    obj.htmlContent = `<p style="color: black;">${highlightedContent}</p>`;

    return obj;
  } catch (error) {
    console.log("createObj", error.message);
    throw error; // Re-throw the error to propagate it
  }
}

async function getPendingMilkingCows(gaushala_id) {
  try {
    const todayDate = getTodayDate();
    let pendingCows = {};

    const allMilkingCows = await COW.find({ type: ['Milking', 'Milking-Pregnant'], isFemale: true, gaushala_id: gaushala_id });
    const tagIds = allMilkingCows.map(cow => cow.tag_id);

    const todayMilksmorning = await Milk.find({ date: todayDate, day_time: "morning", gaushala_id: gaushala_id });
    const milkTagIdsmorning = todayMilksmorning.map(milksCow => milksCow.cow_tag_id);

    const todayMilksevening = await Milk.find({ date: todayDate, day_time: "evening", gaushala_id: gaushala_id });
    const milkTagIdsevening = todayMilksevening.map(milksCow => milksCow.cow_tag_id);

    pendingCows.morning = tagIds.filter(tagId => !milkTagIdsmorning.includes(tagId));
    pendingCows.evening = tagIds.filter(tagId => !milkTagIdsevening.includes(tagId));

    return pendingCows;

  } catch (error) {
    console.log(error.message);
    return;
  }
}

async function getNewPendingMilkingCows(gaushala_id) {
  try {
    const todayDate = getTodayDate();
    let pendingCows = {};

    const allMilkingCows = await COW.find({ type: ['Milking', 'Milking-Pregnant'], isFemale: true, gaushala_id: gaushala_id });
    const tagIds = allMilkingCows.map(cow => cow.tag_id);

    const todayMilksmorning = await Milk.find({ date: todayDate, day_time: "morning", gaushala_id: gaushala_id });
    const milkTagIdsmorning = todayMilksmorning.map(milksCow => milksCow.cow_tag_id);

    const todayMilksevening = await Milk.find({ date: todayDate, day_time: "evening", gaushala_id: gaushala_id });
    const milkTagIdsevening = todayMilksevening.map(milksCow => milksCow.cow_tag_id);

    pendingCows.morning = tagIds.filter(tagId => !milkTagIdsmorning.includes(tagId));
    pendingCows.evening = tagIds.filter(tagId => !milkTagIdsevening.includes(tagId));

    return pendingCows;

  } catch (error) {
    console.log(error.message);
    return;
  }
}

// const addAppVirsion = async (req, res) => {
//   try {
//     let data = req.body;

//     // Read the existing data from the JSON file
//     const filePath = path.join(__dirname, '..', '..', '..', 'utils', 'master_data.json');
//     let rawData = fs.readFileSync(filePath);
//     let masterData = JSON.parse(rawData);

//     const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' };
//     let dateTime = new Date().toLocaleString(undefined, options);
//     data.dateTime = dateTime;
//     // Determine the last srNo in the array
//     let lastSrNo = masterData.length > 0 ? masterData[masterData.length - 1].srNo : 0;

//     // Increment the last srNo to get the new srNo for the data
//     let newSrNo = lastSrNo + 1;
//     data.srNo = newSrNo; // Add the srNo field to the data

//     // Add the new data to the master data array
//     masterData.push(data);

//     // Write the updated data back to the JSON file
//     fs.writeFileSync(filePath, JSON.stringify(masterData, null, 2));

//     return res.success({ data: masterData });
//   } catch (error) {
//     return res.internalServerError({ message: error.message });
//   }
// }

// const getLatestAppVersion = async (req, res) => {
//   try {
//     const filePath = path.join(__dirname, '..', '..', '..', 'utils', 'master_data.json');
//     let rawData = fs.readFileSync(filePath);
//     let masterData = JSON.parse(rawData);

//     let greatestObject = masterData.reduce((maxItem, currentItem) => {
//       return currentItem.srNo > maxItem.srNo ? currentItem : maxItem;
//     }, { srNo: -Infinity });

//     return res.success({ data: greatestObject });

//   } catch (error) {
//     return res.internalServerError({ message: error.message });
//   }
// }


const addAppVersion = async (req, res) => {
  try {
    let data = req.body;

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' };
    let dateTime = new Date().toLocaleString(undefined, options);
    data.dateTime = dateTime;

    const findAppVersionObject = await dbService.findOne(DairyMetrics, { remark: 'APP_VERSION', gaushala_id: 'APP_CONFIG' });
    if (!findAppVersionObject) {
      let dataToCreate = {
        remark: 'APP_VERSION',
        gaushala_id: 'APP_CONFIG',
        item_name: data.appLink,
        value: data.appVersion,
        date: data.dateTime,
        isDeleted: false
      }

      let createdAppVersion = await dbService.create(DairyMetrics, dataToCreate);

      const createdVersion = {
        appVersion: createdAppVersion.value,
        appLink: createdAppVersion.item_name,
        dateTime: createdAppVersion.date
      }

      return res.success({ data: createdVersion });
    }

    const updateAppVersion = await dbService.updateOne(DairyMetrics, { remark: 'APP_VERSION', gaushala_id: 'APP_CONFIG' }, { value: data.appVersion, date: data.dateTime, item_name: data.appLink });

    const updatedVersion = {
      appVersion: updateAppVersion.value,
      appLink: updateAppVersion.item_name,
      dateTime: updateAppVersion.date
    }

    return res.success({ data: updatedVersion });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
}

const getLatestAppVersion = async (req, res) => {
  try {
    const getLatestAppVersion = await dbService.findOne(DairyMetrics, { remark: 'APP_VERSION', gaushala_id: 'APP_CONFIG' });

    if (!getLatestAppVersion) {
      return res.recordNotFound({ message: 'App version not found' });
    }

    const appVersion = {
      appVersion: getLatestAppVersion.value,
      appLink: getLatestAppVersion.item_name,
      dateTime: getLatestAppVersion.date
    }

    return res.success({ data: appVersion });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
}

module.exports = {
  getPendingMilkingCows,
  getReminders,
  updateSevenDayMilkData,
  updateHistory,
  cronForDashboard,
  addDairyMetrics,
  findAllDairyMetrics,
  getDairyMetrics,
  getDairyMetricsCount,
  updateDairyMetrics,
  partialUpdateDairyMetrics,
  addAppVersion,
  getLatestAppVersion
};