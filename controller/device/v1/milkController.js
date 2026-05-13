const Milk = require('../../../model/milk');
const milkSchemaKey = require('../../../utils/validation/milkValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/common');
const COW = require('../../../model/COW');
const MilkUsage = require('../../../model/milk_usage');
const fs = require('fs');
const path = require('path');

const dairy_product = require('../../../model/dairy_product');
const { isToday, getTodayDate, getDateBeforeLastSevenDays } = require('../../../utils/common');
const vendor = require('../../../model/vdr');
const item_master = require('../../../model/item_master');
const { all } = require('../../../routes/device/v1/stockRoutes');
const milk_history = require('../../../model/milk_history');

const { updateSevenDayMilkData, getPendingMilkingCows, updateHistory } = require('./DairyMetricsController');
const { db } = require('../../../model/api_logs');
const SalesItems = require('../../../model/sales_items');
const Department = require('../../../model/department');
const default_variable = require('../../../model/default_variable');
const defaultVariableFunctions = require('../../../utils/defaultVariableFunctions');


//get last 7 day's data
const lastSevenDayMilkData = async (req, res) => {
  const todayDate = getTodayDate();
  // if (milk_histories_today.length == 0) {
  //   await cronForDashboard();
  // }
  const gaushala_id = req.user.gaushala_id
  await updateSevenDayMilkData(gaushala_id);  

  let milkDate = '';
  let last7DayMilks = [];
  let query = {};
  query.gaushala_id = req.user.gaushala_id;
  const last7DayDate = getDateBeforeLastSevenDays();

  query.date = {
    $gte: last7DayDate,
    $lte: todayDate,
  };

  const pipeline = [
    {
      $match: query
    },
    {
      $project: {
        "createdAt": 0,
        "updatedAt": 0,
        "isDeleted": 0
      }
    },
    {
      $sort: {
        "date": 1 // Sort by date in ascending order
      }
    }
  ];

  last7DayMilks = await milk_history.aggregate(pipeline);

  const pendingCows = await getPendingMilkingCows(req.user.gaushala_id);

  return res.success({ data: { last7DayMilks, pendingCows } });
};

//get today's total milk liter
const todayTotalMilk = async (req, res) => {

  try {
    const todayDate = getTodayDate();
    // const todayDate = "2023-11-05";
    const query = {};
    query.date = todayDate;
    query.gaushala_id = req.user.gaushala_id;
    // query.gaushala_id = '01';

    const pipeline = [
      {
        $match: query,
      },
      {
        $group: {
          _id: null,
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
          _id: 0, // Exclude _id from the result
          uniqueCowTagIds: 0, // Exclude the uniqueCowTagIds array
        },
      },
    ];

    const todayMilkAgreegation = await Milk.aggregate(pipeline);

    let todaysMilk = 0;
    let milkingCows = 0;

    if (todayMilkAgreegation.length === 0) {
      todaysMilk = 0;
      milkingCows = 0;
    } else {
      todaysMilk = todayMilkAgreegation[0].totalLiter;
      milkingCows = todayMilkAgreegation[0].countUniqueCowTagIds;
    }

    const pipelineForUsage = [
      {
        $match: {
          gaushala_id: query.gaushala_id,
          date: todayDate,
          // $expr: {
          //   $eq: [
          //     {
          //       $dateToString: {
          //         format: '%Y-%m-%d',
          //         date: '$createdAt',
          //       },
          //     },
          //     todayDate,
          //   ],
          // },
        },
      },
      {
        $group: {
          _id: todayDate,
          totalLiter: { $sum: { $toDouble: '$liter' } },
        },
      },
    ];

    const todayMilkUsageAgreegation = await MilkUsage.aggregate(pipelineForUsage);

    let todayMilkUsage = 0;

    if (todayMilkUsageAgreegation.length === 0) {
      todayMilkUsage = 0;
    } else {
      todayMilkUsage = todayMilkUsageAgreegation[0].totalLiter;
    }

    return res.success({ data: { todaysMilk, milkingCows, todayMilkUsage } });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }


}

const todayMilkHistory = async (req, res) => {
  try {
    const todayDate = getTodayDate();
    const allMilkingCows = await COW.find({ isFemale: true, type: ['Milking-Pregnant', 'Milking'], gaushala_id: req.user.gaushala_id });
    let todayMilkFiltered = [];
    let todayMorningMilkCount = `0/${allMilkingCows.length}`;
    let todayEveningMilkCount = `0/${allMilkingCows.length}`;

    let query = {};
    query.date = todayDate;
    query.gaushala_id = req.user.gaushala_id
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
          todayMorningMilkCount = `${todatMilkData[i].countUniqueCowTagIds}/${allMilkingCows.length}`;
        } else {
          todayEveningMilkCount = `${todatMilkData[i].countUniqueCowTagIds}/${allMilkingCows.length}`
        }

      }
    }

    let query_milk = {};
    query_milk.date = todayDate;
    query_milk.gaushala_id = req.user.gaushala_id
    query_milk.cow_tag_id = req.params.id;
    const todayMilkFilteredPipeline = [
      {
        $match: query_milk
      }
    ];
    todayMilkFiltered = await Milk.aggregate(todayMilkFilteredPipeline);

    const todayMilk = await Milk.find({ cow_tag_id: req.params.id, gaushala_id: req.user.gaushala_id });
    // Get the last one elements from the todayMilk array
    let cowsLastMilkLiter = '';


    if (todayMilk.length > 0) {
      const lastTwoMilk = todayMilk.slice(-1);
      cowsLastMilkLiter = lastTwoMilk[0].liter.toString();
    }

    return res.success({ data: { todayMorningMilkCount, todayEveningMilkCount, cowsLastMilkLiter, todayMilkFiltered } });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getTodayMilkHistory = async (req, res) => {

  //this api is used for milk report from mobile 
  try {
    let query = {};
    // query.date = req.body.date;

    if (req.body.cow_tag_id !== '') {
      query.cow_tag_id = req.body.cow_tag_id;
    }

    if (req.body.startDate && req.body.endDate) {
      // Convert the date strings to Date objects
      const startDate = req.body.startDate;
      const endDate = req.body.endDate;

      // Add a date range condition to the query
      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    query.gaushala_id = req.user.gaushala_id
    //query.gaushala_id = "01"

    const pipeline = [
      {
        $match: query
      },
      {
        $lookup: {
          from: "cows",
          localField: "cow_tag_id",
          foreignField: "tag_id",
          as: "cow",
          pipeline: [
            {
              $match: {
                gaushala_id: query.gaushala_id
              }
            }
          ]
        }
      },
      {
        $unwind: "$cow"
      },
      {
        $group: {
          _id: {
            cow_tag_id: '$cow_tag_id',
            date: '$date',
            shed_id: '$cow.shed_id',
          },
          morning: {
            $sum: {
              $cond: [{ $eq: ["$day_time", "morning"] }, "$liter", 0]
            }
          },
          evening: {
            $sum: {
              $cond: [{ $eq: ["$day_time", "evening"] }, "$liter", 0]
            }
          },
          total: { $sum: '$liter' },
        }
      },
      {
        $project: {
          _id: 0,
          cow_tag_id: '$_id.cow_tag_id',
          gaushala_id: 1,
          date: '$_id.date',
          morning: 1,
          evening: 1,
          shed_id: '$_id.shed_id',
          total: { $round: ['$total', 2] }  // Rounds the total to 2 decimal places
        }
      }, {
        $sort: {
          date: 1
        }
      }
    ];


    const milk = await Milk.aggregate(pipeline);

    if (!milk || milk.length === 0) {
      return res.recordNotFound();
    }

    // get summary data
    const summaryPipeline = [
      {
        $match: query
      },
      {
        $lookup: {
          from: "cows",
          localField: "cow_tag_id",
          foreignField: "tag_id",
          as: "cow",
          pipeline: [
            {
              $match: {
                gaushala_id: query.gaushala_id
              }
            }
          ]
        }
      },
      {
        $unwind: "$cow"
      },
      {
        $group: {
          // _id: "$cow.breed",
          // cow_tag_id: '$cow_tag_id',
          // date: '$date',
          _id: {
            // cow_tag_id: '$cow_tag_id',
            breed: "$cow.breed",
            date: '$date',

          },
          // Count number of cows of each breed
          uniqueCows: { $addToSet: "$cow_tag_id" }, // Collect unique cow_tag_id values
          milk_count: { $sum: "$liter" }, // Sum the milk produced by each breed
          morning: {
            $sum: {
              $cond: [{ $eq: ["$day_time", "morning"] }, "$liter", 0]
            }
          },
          evening: {
            $sum: {
              $cond: [{ $eq: ["$day_time", "evening"] }, "$liter", 0]
            }
          },
        }
      },
      {
        $project: {
          _id: 0,
          breed: "$_id.breed",
          cows_count: { $size: "$uniqueCows" },
          milk_count: { $round: ['$milk_count', 2] },
          tag_id: "$uniqueCows",
          date: "$_id.date",
          // morning: 1,
          // evening: 1,
        }
      }, {
        $sort: {
          date: 1
        }
      }
    ];

    const summary = await Milk.aggregate(summaryPipeline);

    if (!summary || summary.length === 0) {
      return res.recordNotFound();
    }
    // const pendingCows = await getPendingMilkingCows1(req.user.gaushala_id);
    const pendingCows = await getPendingCowsDateWise(req.user.gaushala_id, query.date.$gte, query.date.$lte);
    

    return res.success({ data: { milk, summary, pendingCows } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

function formatDate(dateObj) {
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
}

async function getPendingCowsDateWise(gaushala_id, fromDate, toDate) {
  try {

    // 1️⃣ Get all milking cows
    const allMilkingCows = await COW.find({
      gaushala_id: gaushala_id,
      isFemale: true,
      type: { $in: ['Milking', 'Milking-Pregnant'] },
      isDeleted: false
    }).select('tag_id shed_id');

    const allCows = allMilkingCows.map(cow => ({
      tagId: cow.tag_id,
      shedId: cow.shed_id || ''
    }));

    console.log("allCows", allCows);

    // 2️⃣ Generate date range array
    const dates = [];
    let current = new Date(fromDate);
    const end = new Date(toDate);

    while (current <= end) {
      dates.push(formatDate(current));
      current.setDate(current.getDate() + 1);
    }

    const result = [];

    // 3️⃣ Loop each date
    for (let date of dates) {

      const milkEntries = await Milk.find({
        gaushala_id: gaushala_id,
        date: date,
        isDeleted: false
      }).select('cow_tag_id day_time');

      const morningMilkTagIds = milkEntries
        .filter(m => m.day_time === 'morning')
        .map(m => m.cow_tag_id);

      const eveningMilkTagIds = milkEntries
        .filter(m => m.day_time === 'evening')
        .map(m => m.cow_tag_id);

      const pendingMorning = allCows.filter(
        cow => !morningMilkTagIds.includes(cow.tagId)
      );

      const pendingEvening = allCows.filter(
        cow => !eveningMilkTagIds.includes(cow.tagId)
      );

      result.push({
        date: date,
        morning: pendingMorning,
        evening: pendingEvening
      });
    }

    return result || [];

  } catch (error) {
    console.log(error.message);
  }
}




const addMilk = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      milkSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    dataToCreate.gaushala_id = req.user.gaushala_id;
    dataToCreate = new Milk(dataToCreate);
    let createdMilk = await dbService.create(Milk, dataToCreate);
    return res.success({ data: createdMilk });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const validateMilk = async (req, res) => {
  try {
    const tag_id = req.body.cow_tag_id;
    const date = req.body.date;
    const day_time = req.body.day_time;

    const findValidCow = await dbService.findOne(COW, { tag_id: tag_id, type: ['Milking', 'Milking-Pregnant'] })
    let dataToReturn = {};
    if (!findValidCow) {
      dataToReturn = {
        "isValid": false,
        "data": `${tag_id} is not milking cow`
      }

      return res.success({ data: dataToReturn });
    }

    const findMilk = await dbService.findOne(Milk, { cow_tag_id: tag_id, date: date, day_time: day_time, gaushala_id: req.user.gaushala_id });

    // let dataToReturn = {};
    if (!findMilk) {
      dataToReturn = {
        "isValid": true,
        "data": "Added milk data"
      }

      return res.success({ data: dataToReturn });
    }

    dataToReturn = {
      "isValid": false,
      "data": `Milk already added for cow ${findMilk.cow_tag_id}, Milk liter is ${findMilk.liter}`
    }

    return res.success({ data: dataToReturn });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }

}

const bulkInsertMilk = async (req, res) => {
  try {
    if (req.body && (!Array.isArray(req.body.data) || req.body.data.length < 1)) {
      return res.badRequest();
    }
    let dataToCreate = [...req.body.data];

    for (let i = 0; i < dataToCreate.length; i++) {
      dataToCreate[i].gaushala_id = req.user.gaushala_id
    }

    let createdMilks = await dbService.create(Milk, dataToCreate);
    createdMilks = { count: createdMilks ? createdMilks.length : 0 };

    await updateHistory(req, res);

    return res.success({ data: { count: createdMilks.count || 0 } });
  } catch (error) {
    console.log(error);
    return res.internalServerError({ message: error.message });
  }
};


const findAllMilk = async (req, res) => {
  try {
    let options = {};
    let query = {};
    query.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      milkSchemaKey.findFilterKeys,
      Milk.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
    if (req.body.isCountOnly) {
      let totalRecords = await dbService.count(Milk, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundMilks = await dbService.paginate(Milk, query, options);
    if (!foundMilks || !foundMilks.data || !foundMilks.data.length) {
      return res.recordNotFound();
    }
    return res.success({ data: foundMilks });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const getMilk = async (req, res) => {
  try {
    let query = {};
    query.gaushala_id = req.user.gaushala_id;
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message: 'invalid objectId.' });
    }
    query._id = req.params.id;
    let options = {};
    let foundMilk = await dbService.findOne(Milk, query, options);
    if (!foundMilk) {
      return res.recordNotFound();
    }
    return res.success({ data: foundMilk });
  }
  catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : returns total number of documents of Milk.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getMilkCount = async (req, res) => {
  try {
    let where = {};
    where.gaushala_id = req.user.gaushala_id;
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      milkSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedMilk = await dbService.count(Milk, where);
    return res.success({ data: { count: countedMilk } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update document of Milk with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Milk.
 * @return {Object} : updated Milk. {status, message, data}
 */
const updateMilk = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      milkSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedMilk = await dbService.updateOne(Milk, query, dataToUpdate);
    if (!updatedMilk) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedMilk });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update multiple records of Milk with data by filter.
 * @param {Object} req : request including filter and data in request body.
 * @param {Object} res : response of updated Milks.
 * @return {Object} : updated Milks. {status, message, data}
 */
const bulkUpdateMilk = async (req, res) => {
  try {
    let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
    filter.gaushala_id = req.user.gaushala_id;
    let dataToUpdate = {};
    if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
      dataToUpdate = { ...req.body.data, };
    }
    let updatedMilk = await dbService.updateMany(Milk, filter, dataToUpdate);
    if (!updatedMilk) {
      return res.recordNotFound();
    }
    return res.success({ data: { count: updatedMilk } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : partially update document of Milk with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated Milk.
 * @return {obj} : updated Milk. {status, message, data}
 */
const partialUpdateMilk = async (req, res) => {
  try {
    if (!req.params.id) {
      res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let dataToUpdate = { ...req.body, };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      milkSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    let updatedMilk = await dbService.updateOne(Milk, query, dataToUpdate);
    if (!updatedMilk) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedMilk });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};
/**
 * @description : deactivate document of Milk from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Milk.
 * @return {Object} : deactivated Milk. {status, message, data}
 */
const softDeleteMilk = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    const updateBody = { isDeleted: true, };
    let updatedMilk = await dbService.updateOne(Milk, query, updateBody);
    if (!updatedMilk) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedMilk });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : delete document of Milk from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted Milk. {status, message, data}
 */
const deleteMilk = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id;
    const deletedMilk = await dbService.deleteOne(Milk, query);
    if (!deletedMilk) {
      return res.recordNotFound();
    }
    return res.success({ data: deletedMilk });

  }
  catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : delete documents of Milk in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of documents deleted.
 * @return {Object} : no of documents deleted. {status, message, data}
 */
const deleteManyMilk = async (req, res) => {
  try {
    let ids = req.body.ids;
    if (!ids || !Array.isArray(ids) || ids.length < 1) {
      return res.badRequest();
    }
    let query = { _id: { $in: ids } };
    query.gaushala_id = req.user.gaushala_id;
    const deletedMilk = await dbService.deleteMany(Milk, query);
    if (!deletedMilk) {
      return res.recordNotFound();
    }
    return res.success({ data: { count: deletedMilk } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};
/**
 * @description : deactivate multiple documents of Milk from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated documents of Milk.
 * @return {Object} : number of deactivated documents of Milk. {status, message, data}
 */
const softDeleteManyMilk = async (req, res) => {
  try {
    let ids = req.body.ids;
    if (!ids || !Array.isArray(ids) || ids.length < 1) {
      return res.badRequest();
    }
    let query = { _id: { $in: ids } };
    query.gaushala_id = req.user.gaushala_id;
    const updateBody = { isDeleted: true, };
    let updatedMilk = await dbService.updateMany(Milk, query, updateBody);
    if (!updatedMilk) {
      return res.recordNotFound();
    }
    return res.success({ data: { count: updatedMilk } });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

// Master values
const defaultVariables = async (req, res) => {

  try {

    const vaccinesTransformArray = await dbService.findMany(default_variable, { group: "vaccines", isDeleted: false });
    const vaccines = defaultVariableFunctions.transformArrayOfExpenseType(vaccinesTransformArray);

    const gaushala_listTransformArray = await dbService.findMany(default_variable, { group: "gaushala_list", isDeleted: false });
    const gaushala_list = defaultVariableFunctions.transformArrayOfGaushala_list(gaushala_listTransformArray);

    const vehiclesTransformArray = await dbService.findMany(default_variable, { group: "vehicles", gaushala_id: req.user.gaushala_id, isDeleted: false });
    const vehicles = defaultVariableFunctions.transformArrayOfvehicles(vehiclesTransformArray);

    const distribution_free_personTransformArray = await dbService.findMany(default_variable, { group: "distribution_free_person", gaushala_id: req.user.gaushala_id, isDeleted: false });
    const distribution_free_person = defaultVariableFunctions.transformArrayOfExpenseType(distribution_free_personTransformArray);

    const breedsTransformArray = await dbService.findMany(default_variable, { group: "breeds", isDeleted: false });
    const breeds = defaultVariableFunctions.transformArrayOfExpenseType(breedsTransformArray);

    const cowTypesTransformArray = await dbService.findMany(default_variable, { group: "cowTypes", isDeleted: false });
    const cowTypes = defaultVariableFunctions.transformArrayOfExpenseType(cowTypesTransformArray);

    const expence_typeTransformArray = await dbService.findMany(default_variable, { group: "expense_types", isDeleted: false });
    const expense_types = defaultVariableFunctions.transformArrayOfExpenseType(expence_typeTransformArray);

    const employeeCategoryTransformArray = await dbService.findMany(default_variable, { group: "employeeCategory", isDeleted: false });
    const employeeCategory = defaultVariableFunctions.transformArrayOfExpenseType(employeeCategoryTransformArray);

    const shedsTransformArray = await dbService.findMany(default_variable, { group: "sheds", gaushala_id: req.user.gaushala_id, isDeleted: false });
    const sheds = defaultVariableFunctions.transformArrayOfExpenseType(shedsTransformArray);

    const bullsForTransform = await dbService.findAll(COW, { isFemale: false, type: ['BreedingBull', 'Semen'], gaushala_id: req.user.gaushala_id, isDeleted: false });
    const bulls = defaultVariableFunctions.transformArrayOfBulls(bullsForTransform);

    const dairy_products = await dbService.findAll(dairy_product, { isDeleted: false, isActive: true });
    const items = defaultVariableFunctions.transformArrayOfProducts(dairy_products);

    const all_vendors = await dbService.findAll(vendor, { gaushala_id: req.user.gaushala_id, isDeleted: false, isActive: true });
    const vendors = defaultVariableFunctions.transformArrayOfVendors(all_vendors);

    const all_item_master = await dbService.findAll(item_master, { gaushala_id: req.user.gaushala_id, isDeleted: false });
    const item_masters = defaultVariableFunctions.transformArrayOfMasterItems(all_item_master);

    const all_sales_items = await dbService.findAll(SalesItems, { isDeleted: false, gaushala_id: req.user.gaushala_id });
    const sales_items = defaultVariableFunctions.transformArrayOfSalesItems(all_sales_items)

    const all_departments = await dbService.findAll(Department, { gaushala_id: req.user.gaushala_id, isDeleted: false });
    const department = defaultVariableFunctions.transformArrayOfDepartment(all_departments)

    // const filePath = path.join(__dirname, '..', '..', '..', 'utils', 'master_data.json');

    // fs.readFile(filePath, 'utf8', (err, data) => {
    //   if (err) {
    //     return res.status(500).json({ error: 'Error reading data file' });
    //   }

    //   const jsonData = JSON.parse(data);
    //   jsonData.vendors = vendors;
    //   jsonData.bulls = bulls;
    //   jsonData.items = items;
    //   jsonData.item_master = item_masters;
    //   jsonData.sales_items = sales_items;
    //   jsonData.department = department;
    //   jsonData.expense_types = expense_types;
    //   jsonData.employeeCategory = employeeCategory;
    //   jsonData.sheds = sheds;
    //   jsonData.cowTypes = cowTypes;
    //   jsonData.breeds = breeds;
    //   jsonData.distribution_free_person = distribution_free_person;
    //   jsonData.vehicles = vehicles;
    //   jsonData.gaushala_list = gaushala_list;
    //   jsonData.vaccines = vaccines;


    // });

    const defaultData = {
      vendors,
      bulls,
      items,
      item_master: item_masters,
      sales_items,
      department,
      expense_types,
      employeeCategory,
      sheds,
      cowTypes,
      breeds,
      distribution_free_person,
      vehicles,
      gaushala_list,
      vaccines,
    }

    return res.success({ data: defaultData });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }

};

async function getPendingMilkingCows1(gaushala_id) {
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

module.exports = {
  getTodayMilkHistory,
  validateMilk,
  isToday,
  lastSevenDayMilkData,
  todayTotalMilk,
  defaultVariables,
  todayMilkHistory,
  addMilk,
  bulkInsertMilk,
  findAllMilk,
  getMilk,
  getMilkCount,
  updateMilk,
  bulkUpdateMilk,
  partialUpdateMilk,
  softDeleteMilk,
  deleteMilk,
  deleteManyMilk,
  softDeleteManyMilk
};