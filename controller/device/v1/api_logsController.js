/**
 * api_logsController.js
 * @description : exports action methods for api_logs.
 */

const Api_logs = require('../../../model/api_logs');
const api_logsSchemaKey = require('../../../utils/validation/api_logsValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/common');
const COW = require('../../../model/COW');

/**
 * @description : create document of Api_logs in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Api_logs. {status, message, data}
 */
const addApi_logs = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      api_logsSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    dataToCreate = new Api_logs(dataToCreate);
    let createdApi_logs = await dbService.create(Api_logs, dataToCreate);
    return res.success({ data: createdApi_logs });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find all documents of Api_logs from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Api_logs(s). {status, message, data}
 */
const findAllApi_logs = async (req, res) => {
  try {
    let options = {};
    let query = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      api_logsSchemaKey.findFilterKeys,
      Api_logs.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
    if (req.body.isCountOnly) {
      let totalRecords = await dbService.count(Api_logs, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundApi_logss = await dbService.paginate(Api_logs, query, options);
    if (!foundApi_logss || !foundApi_logss.data || !foundApi_logss.data.length) {
      return res.recordNotFound();
    }
    return res.success({ data: foundApi_logss });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find document of Api_logs from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Api_logs. {status, message, data}
 */
const getApi_logs = async (req, res) => {
  try {
    let query = {};
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message: 'invalid objectId.' });
    }
    query._id = req.params.id;
    let options = {};
    let foundApi_logs = await dbService.findOne(Api_logs, query, options);
    if (!foundApi_logs) {
      return res.recordNotFound();
    }
    return res.success({ data: foundApi_logs });
  }
  catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : returns total number of documents of Api_logs.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getApi_logsCount = async (req, res) => {
  try {
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      api_logsSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedApi_logs = await dbService.count(Api_logs, where);
    return res.success({ data: { count: countedApi_logs } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};


// update cow birth date
const setCowBdays = async (req, res) => {
  const outputArray = inputArray.map(item => {
    // Convert tag_id to string
    const tag_id = item.tag_id.toString();

    // Convert month name to month number
    const monthNames = {
      "Jan": "01",
      "Feb": "02",
      "Mar": "03",
      "Apr": "04",
      "May": "05",
      "Jun": "06",
      "Jul": "07",
      "Aug": "08",
      "Sep": "09",
      "Oct": "10",
      "Nov": "11",
      "Dec": "12"
    };

    const dobParts = item.dob.split('-');
    const monthNumber = monthNames[dobParts[1]];

    // Convert dob to the desired format "YYYY-MM-DD"
    const dobFormatted = `20${dobParts[2]}-${monthNumber}-${dobParts[0]}`;

    return {
      tag_id,
      dob: dobFormatted
    };
  });

  return res.success({ data: outputArray });
}

const inputArray = [
  {
    "tag_id": "KJ-1020",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "KJ-1021",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "KJ-1060",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "KJ-1",
    "dob": "2016-01-26"
  },
  {
    "tag_id": "KJ-2",
    "dob": "2016-01-26"
  },
  {
    "tag_id": "KJ-3",
    "dob": "2016-01-26"
  },
  {
    "tag_id": "KJ-4",
    "dob": "2016-01-26"
  },
  {
    "tag_id": "KJ-5",
    "dob": "2016-01-26"
  },
  {
    "tag_id": "KJ-6",
    "dob": "2016-01-26"
  },
  {
    "tag_id": "KJ-7",
    "dob": "2016-01-26"
  },
  {
    "tag_id": "KJ-8",
    "dob": "2016-01-26"
  },
  {
    "tag_id": "KJ-9",
    "dob": "2016-01-26"
  },
  {
    "tag_id": "KJ-10",
    "dob": "2016-01-26"
  },
  {
    "tag_id": "KJ-11",
    "dob": "2016-01-26"
  },
  {
    "tag_id": "KJ-12",
    "dob": "2016-01-26"
  },
  {
    "tag_id": "KJ-13",
    "dob": "2016-01-26"
  },
  {
    "tag_id": "KJ-14",
    "dob": "2016-01-26"
  },
  {
    "tag_id": "KJ-16",
    "dob": "2017-01-11"
  },
  {
    "tag_id": "KJ-A-1",
    "dob": "2017-01-12"
  },
  {
    "tag_id": "KJ-17",
    "dob": "2017-03-20"
  },
  {
    "tag_id": "KJ-18",
    "dob": "2017-09-23"
  },
  {
    "tag_id": "KJ A-2",
    "dob": "2017-09-23"
  },
  {
    "tag_id": "KJ-19",
    "dob": "2017-09-25"
  },
  {
    "tag_id": "KJ A-3",
    "dob": "2017-11-1"
  },
  {
    "tag_id": "KJ-20",
    "dob": "2017-11-13"
  },
  {
    "tag_id": "KJ-21",
    "dob": "2017-11-22"
  },
  {
    "tag_id": "KJ-22",
    "dob": "2017-12-2"
  },
  {
    "tag_id": "KJ-23",
    "dob": "2018-02-6"
  },
  {
    "tag_id": "KJ A-4",
    "dob": "2017-12-15"
  },
  {
    "tag_id": "KJ-24",
    "dob": "2018-02-6"
  },
  {
    "tag_id": "0",
    "dob": "2018-04-19"
  },
  {
    "tag_id": "KJ A-5",
    "dob": "2018-06-21"
  },
  {
    "tag_id": "KJ A-6",
    "dob": "2018-10-4"
  },
  {
    "tag_id": "KJ-25",
    "dob": "2018-10-21"
  },
  {
    "tag_id": "KJ-26",
    "dob": "2018-11-27"
  },
  {
    "tag_id": "KJ A-7",
    "dob": "2018-12-10"
  },
  {
    "tag_id": "KJ A-8",
    "dob": "2018-12-31"
  },
  {
    "tag_id": "0",
    "dob": "2019-02-3"
  },
  {
    "tag_id": "0",
    "dob": "2019-02-8"
  },
  {
    "tag_id": "KJ-27",
    "dob": "2019-05-23"
  },
  {
    "tag_id": "KJ A-9",
    "dob": "2019-06-2"
  },
  {
    "tag_id": "KJ A-10",
    "dob": "2019-06-6"
  },
  {
    "tag_id": "KJ-28",
    "dob": "2019-06-6"
  },
  {
    "tag_id": "KJ-29",
    "dob": "2019-10-3"
  },
  {
    "tag_id": "KJ-30",
    "dob": "2019-10-3"
  },
  {
    "tag_id": "KJ-31",
    "dob": "2019-10-3"
  },
  {
    "tag_id": "KJ-32",
    "dob": "2019-10-3"
  },
  {
    "tag_id": "KJ-33",
    "dob": "2019-10-3"
  },
  {
    "tag_id": "KJ-34",
    "dob": "2019-10-3"
  },
  {
    "tag_id": "KJ-35",
    "dob": "2019-10-3"
  },
  {
    "tag_id": "KJ-36",
    "dob": "2019-10-3"
  },
  {
    "tag_id": "KJ-37",
    "dob": "2019-10-3"
  },
  {
    "tag_id": "KJ-38",
    "dob": "2019-10-3"
  },
  {
    "tag_id": "KJ-39",
    "dob": "2019-10-3"
  },
  {
    "tag_id": "KJ-40",
    "dob": "2019-10-3"
  },
  {
    "tag_id": "KJ-41",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "KJ-42",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "KJ-43",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "KJ A-11",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "KJ-44",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "KJ-45",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "KJ-46",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "KJ-47",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "KJ-48",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "KJ-49",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "KJ-50",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "KJ-51",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "KJ-52",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "KJ-41",
    "dob": "2019-12-4"
  },
  {
    "tag_id": "KJ- A-12",
    "dob": "2020-03-26"
  },
  {
    "tag_id": "KJ A-13",
    "dob": "2020-04-15"
  },
  {
    "tag_id": "KJ A-14",
    "dob": "2020-04-22"
  },
  {
    "tag_id": "KJ-53",
    "dob": "2020-04-28"
  },
  {
    "tag_id": "KJ A-15",
    "dob": "2020-04-28"
  },
  {
    "tag_id": "KJ A-16",
    "dob": "2020-04-30"
  },
  {
    "tag_id": "KJ A-17",
    "dob": "2020-05-5"
  },
  {
    "tag_id": "KJ A-18",
    "dob": "2020-05-7"
  },
  {
    "tag_id": "KJ-54",
    "dob": "2020-06-21"
  },
  {
    "tag_id": "KJ A-19",
    "dob": "2020-08-3"
  },
  {
    "tag_id": "KJ A-20",
    "dob": "2020-08-17"
  },
  {
    "tag_id": "KJ A-21",
    "dob": "2020-08-20"
  },
  {
    "tag_id": "KJ A-22",
    "dob": "2020-10-16"
  },
  {
    "tag_id": "KJ-55",
    "dob": "2020-10-23"
  },
  {
    "tag_id": "KJ A-22",
    "dob": "2020-12-1"
  },
  {
    "tag_id": "KJ A-23",
    "dob": "2020-12-6"
  },
  {
    "tag_id": "KJ-56",
    "dob": "2020-12-12"
  },
  {
    "tag_id": "KJ-57",
    "dob": "2020-12-16"
  },
  {
    "tag_id": "KJ A-24",
    "dob": "2021-01-6"
  },
  {
    "tag_id": "KJ A-25",
    "dob": "2021-01-25"
  },
  {
    "tag_id": "KJ-58",
    "dob": "2021-03-18"
  },
  {
    "tag_id": "KJ-59",
    "dob": "2021-04-23"
  },
  {
    "tag_id": "0",
    "dob": "2021-05-30"
  },
  {
    "tag_id": "KJ-60",
    "dob": "2021-06-3"
  },
  {
    "tag_id": "KJ A-26",
    "dob": "2021-06-6"
  },
  {
    "tag_id": "KJ-61",
    "dob": "2021-06-11"
  },
  {
    "tag_id": "KJ-62",
    "dob": "2021-06-11"
  },
  {
    "tag_id": "KJ-63",
    "dob": "2021-04-22"
  },
  {
    "tag_id": "KJ-64",
    "dob": "2021-08-9"
  },
  {
    "tag_id": "KJ-65",
    "dob": "2021-08-10"
  },
  {
    "tag_id": "KJ A-27",
    "dob": "2021-09-5"
  },
  {
    "tag_id": "KJ-66",
    "dob": "2021-09-12"
  },
  {
    "tag_id": "KJ A-28",
    "dob": "2021-09-29"
  },
  {
    "tag_id": "KJ-67",
    "dob": "2021-10-4"
  },
  {
    "tag_id": "KJ-68",
    "dob": "2021-10-8"
  },
  {
    "tag_id": "KJ-69",
    "dob": "2021-10-11"
  },
  {
    "tag_id": "KJ A-29",
    "dob": "2021-10-23"
  },
  {
    "tag_id": "KJ A-30",
    "dob": "2021-11-8"
  },
  {
    "tag_id": "KJ-70",
    "dob": "2021-11-9"
  },
  {
    "tag_id": "KJ-71",
    "dob": "2021-11-10"
  },
  {
    "tag_id": "KJ A-31",
    "dob": "2021-11-13"
  },
  {
    "tag_id": "KJ A-32",
    "dob": "2021-11-27"
  },
  {
    "tag_id": "KJ-72",
    "dob": "2021-12-5"
  },
  {
    "tag_id": "KJ A-33",
    "dob": "2021-12-7"
  },
  {
    "tag_id": "KJ A-34",
    "dob": "2022-01-2"
  },
  {
    "tag_id": "KJ A-35",
    "dob": "2022-01-10"
  },
  {
    "tag_id": "KJ-73",
    "dob": "2022-01-22"
  },
  {
    "tag_id": "KJ-74",
    "dob": "2022-04-10"
  },
  {
    "tag_id": "KJ A-36",
    "dob": "2022-06-22"
  },
  {
    "tag_id": "KJ-75",
    "dob": "2022-06-24"
  },
  {
    "tag_id": "KJ-76",
    "dob": "2022-07-14"
  },
  {
    "tag_id": "KJ-77",
    "dob": "2022-07-18"
  },
  {
    "tag_id": "KJ-78",
    "dob": "2022-07-24"
  },
  {
    "tag_id": "KJ-79",
    "dob": "2022-07-30"
  },
  {
    "tag_id": "KJ A-37",
    "dob": "2022-08-06"
  },
  {
    "tag_id": "KJ A-38",
    "dob": "2022-09-03"
  },
  {
    "tag_id": "KJ-80",
    "dob": "2022-09-14"
  },
  {
    "tag_id": "KJ A-39",
    "dob": "2022-09-21"
  },
  {
    "tag_id": "KJ A-40",
    "dob": "2022-10-11"
  },
  {
    "tag_id": "KJ A-41",
    "dob": "2022-10-16"
  },
  {
    "tag_id": "KJ-81",
    "dob": "2022-10-24"
  },
  {
    "tag_id": "KJ A-42",
    "dob": "2022-11-8"
  },
  {
    "tag_id": "KJ A-43",
    "dob": "2022-11-21"
  },
  {
    "tag_id": "KJ-82",
    "dob": "2022-12-30"
  },
  {
    "tag_id": "KJ A-44",
    "dob": "2023-01-16"
  },
  {
    "tag_id": "KJ-83",
    "dob": "2023-01-20"
  },
  {
    "tag_id": "KJ A-45",
    "dob": "2023-02-19"
  },
  {
    "tag_id": "KJ A-46",
    "dob": "2023-03-2"
  },
  {
    "tag_id": "KJ-84",
    "dob": "2023-03-8"
  },
  {
    "tag_id": "OG-1",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "OG-2",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "OG-3",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "OG-4",
    "dob": "2016-04-26"
  },
  {
    "tag_id": "OG A-1",
    "dob": "2016-05-4"
  },
  {
    "tag_id": "OG-5",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "NA",
    "dob": "2017-03-27"
  },
  {
    "tag_id": "OG-6",
    "dob": "2017-04-30"
  },
  {
    "tag_id": "OG-A-2",
    "dob": "2017-10-11"
  },
  {
    "tag_id": "OG-7",
    "dob": "2018-06-2"
  },
  {
    "tag_id": "OG A-3",
    "dob": "2018-08-17"
  },
  {
    "tag_id": "OG-8",
    "dob": "2018-09-26"
  },
  {
    "tag_id": "OG A-5",
    "dob": "2019-01-7"
  },
  {
    "tag_id": "OG-9",
    "dob": "2019-02-8"
  },
  {
    "tag_id": "OG A-6",
    "dob": "2019-09-19"
  },
  {
    "tag_id": "OG A-7",
    "dob": "2019-10-31"
  },
  {
    "tag_id": "OG-10",
    "dob": "2019-11-02"
  },
  {
    "tag_id": "OG A-6",
    "dob": "2020-01-2"
  },
  {
    "tag_id": "OG A-7",
    "dob": "2020-11-08"
  },
  {
    "tag_id": "OG-11",
    "dob": "2020-12-18"
  },
  {
    "tag_id": "OG-12",
    "dob": "2021-03-25"
  },
  {
    "tag_id": "OG A-8",
    "dob": "2021-03-27"
  },
  {
    "tag_id": "OG-13",
    "dob": "2021-05-01"
  },
  {
    "tag_id": "OG A-9",
    "dob": "2021-05-03"
  },
  {
    "tag_id": "OG A-10",
    "dob": "2022-02-12"
  },
  {
    "tag_id": "OG-14",
    "dob": "2022-04-26"
  },
  {
    "tag_id": "OG A-11",
    "dob": "2022-07-16"
  },
  {
    "tag_id": "OG A-12",
    "dob": "2022-08-16"
  },
  {
    "tag_id": "OG-15",
    "dob": "2023-02-03"
  },
  {
    "tag_id": "TPR-1",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "TPR-2",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "TPR-3",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "TPR-4",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "TPR-5",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "TPR A-1",
    "dob": "2015-10-15"
  },
  {
    "tag_id": "TPR-6 (518)",
    "dob": "2016-05-15"
  },
  {
    "tag_id": "TPR A-2",
    "dob": "2016-11-6"
  },
  {
    "tag_id": "TPR-7",
    "dob": "2016-12-10"
  },
  {
    "tag_id": "TPR-8",
    "dob": "2016-12-13"
  },
  {
    "tag_id": "TPR-9",
    "dob": "2016-12-25"
  },
  {
    "tag_id": "TPR-10",
    "dob": "2017-06-28"
  },
  {
    "tag_id": "0",
    "dob": "2018-03-2"
  },
  {
    "tag_id": "TPR A-3",
    "dob": "2018-03-7"
  },
  {
    "tag_id": "TPR- A-4",
    "dob": "2018-03-15"
  },
  {
    "tag_id": "TPR A-5",
    "dob": "2018-01-12"
  },
  {
    "tag_id": "TPR-11",
    "dob": "2019-02-5"
  },
  {
    "tag_id": "TPR A-6",
    "dob": "2019-03-2"
  },
  {
    "tag_id": "TPR-12",
    "dob": "2019-04-6"
  },
  {
    "tag_id": "TPR A-7",
    "dob": "2019-05-15"
  },
  {
    "tag_id": "TPR-13",
    "dob": "2019-11-28"
  },
  {
    "tag_id": "TPR-14",
    "dob": "2020-06-19"
  },
  {
    "tag_id": "TPR-15",
    "dob": "2020-07-27"
  },
  {
    "tag_id": "TPR-16",
    "dob": "2020-12-27"
  },
  {
    "tag_id": "TPR-17",
    "dob": "2021-03-22"
  },
  {
    "tag_id": "TPR A-8",
    "dob": "2021-03-26"
  },
  {
    "tag_id": "TPR A-9",
    "dob": "2021-08-26"
  },
  {
    "tag_id": "TPR A-10",
    "dob": "2021-11-22"
  },
  {
    "tag_id": "TPR A-11",
    "dob": "2022-10-7"
  },
  {
    "tag_id": "TPR A-12",
    "dob": "2022-11-15"
  },
  {
    "tag_id": "TPR A-13",
    "dob": "2023-01-29"
  },
  {
    "tag_id": "TPR-18",
    "dob": "2023-03-15"
  },
  {
    "tag_id": "RT-1028",
    "dob": "2017-11-11"
  },
  {
    "tag_id": "RT-1",
    "dob": "2017-11-11"
  },
  {
    "tag_id": "RT-2",
    "dob": "2019-11-11"
  },
  {
    "tag_id": "RT-3",
    "dob": "2017-11-11"
  },
  {
    "tag_id": "RT-4",
    "dob": "2017-11-11"
  },
  {
    "tag_id": "RT-5",
    "dob": "2017-11-11"
  },
  {
    "tag_id": "RT-6",
    "dob": "2017-11-11"
  },
  {
    "tag_id": "RT-A-1",
    "dob": "2016-12-25"
  },
  {
    "tag_id": "RT-7",
    "dob": "2017-02-15"
  },
  {
    "tag_id": "RT-A-2",
    "dob": "2017-01-15"
  },
  {
    "tag_id": "RT-A-3",
    "dob": "2017-02-20"
  },
  {
    "tag_id": "RT-8",
    "dob": "2017-02-20"
  },
  {
    "tag_id": "RT-9",
    "dob": "2017-01-10"
  },
  {
    "tag_id": "RT-9",
    "dob": "2017-02-02"
  },
  {
    "tag_id": "RT-10",
    "dob": "2017-11-20"
  },
  {
    "tag_id": "RT A-4",
    "dob": "2018-01-23"
  },
  {
    "tag_id": "RT A-5",
    "dob": "2018-04-24"
  },
  {
    "tag_id": "RT A-6",
    "dob": "2018-06-10"
  },
  {
    "tag_id": "RT A-7",
    "dob": "2018-06-20"
  },
  {
    "tag_id": "RT-11",
    "dob": "2019-12-4"
  },
  {
    "tag_id": "RT A-8",
    "dob": "2019-12-6"
  },
  {
    "tag_id": "RT-12",
    "dob": "2019-12-7"
  },
  {
    "tag_id": "RT A-9",
    "dob": "2019-12-21"
  },
  {
    "tag_id": "RT A-10",
    "dob": "2020-02-5"
  },
  {
    "tag_id": "RT A-11",
    "dob": "2020-06-1"
  },
  {
    "tag_id": "RT-13",
    "dob": "2020-08-14"
  },
  {
    "tag_id": "RT-14",
    "dob": "2021-03-24"
  },
  {
    "tag_id": "RT-15",
    "dob": "2021-03-25"
  },
  {
    "tag_id": "RT-16",
    "dob": "2021-04-20"
  },
  {
    "tag_id": "RT-17",
    "dob": "2021-09-18"
  },
  {
    "tag_id": "RT-18",
    "dob": "2021-10-21"
  },
  {
    "tag_id": "RT A-12",
    "dob": "2021-11-08"
  },
  {
    "tag_id": "RT-19",
    "dob": "2021-11-30"
  },
  {
    "tag_id": "RT-20",
    "dob": "2022-08-15"
  },
  {
    "tag_id": "RT-21",
    "dob": "2022-08-26"
  },
  {
    "tag_id": "RT-22",
    "dob": "2022-10-4"
  },
  {
    "tag_id": "RT A-13",
    "dob": "2022-11-27"
  },
  {
    "tag_id": "RT A-14",
    "dob": "2023-05-27"
  },
  {
    "tag_id": "PGR-1",
    "dob": "2020-11-11"
  },
  {
    "tag_id": "PGR-1031",
    "dob": "2018-11-11"
  },
  {
    "tag_id": "PGR-2",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "PGR-3",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "PGR-4",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "PGR-5",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "PGR-1032",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "PGR-6",
    "dob": "2018-01-15"
  },
  {
    "tag_id": "PGR-7",
    "dob": "2018-02-6"
  },
  {
    "tag_id": "PGR A-1",
    "dob": "2018-02-24"
  },
  {
    "tag_id": "PGR A-2",
    "dob": "2019-02-28"
  },
  {
    "tag_id": "PGR A-3",
    "dob": "2019-03-24"
  },
  {
    "tag_id": "PGR A-4",
    "dob": "2019-03-31"
  },
  {
    "tag_id": "PGR-8",
    "dob": "2021-07-29"
  },
  {
    "tag_id": "PGR A-5",
    "dob": "2021-08-09"
  },
  {
    "tag_id": "PGR-9",
    "dob": "2021-10-12"
  },
  {
    "tag_id": "HKR-1",
    "dob": "2006-01-1"
  },
  {
    "tag_id": "HKR-2",
    "dob": "2005-01-1"
  },
  {
    "tag_id": "HKR-3",
    "dob": "2005-01-1"
  },
  {
    "tag_id": "HKR-4",
    "dob": "2012-12-1"
  },
  {
    "tag_id": "HKR-11",
    "dob": "2007-01-1"
  },
  {
    "tag_id": "HKR-5",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "HKR-6",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "HKR-7",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "HKR-8",
    "dob": "2021-11-11"
  },
  {
    "tag_id": "HKR-9",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "HKR-10",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "HKR-12",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "HKR-13",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "HKR-14",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "HKR-15",
    "dob": "2017-04-08"
  },
  {
    "tag_id": "HKR-A-1",
    "dob": "2017-06-14"
  },
  {
    "tag_id": "HKR A-2",
    "dob": "2017-08-16"
  },
  {
    "tag_id": "HKR-16",
    "dob": "2017-11-5"
  },
  {
    "tag_id": "HKR-17",
    "dob": "2018-08-11"
  },
  {
    "tag_id": "HKR A-3",
    "dob": "2018-09-8"
  },
  {
    "tag_id": "HKR-18",
    "dob": "2019-01-6"
  },
  {
    "tag_id": "HKR A-4",
    "dob": "2019-02-7"
  },
  {
    "tag_id": "HKR-A-5",
    "dob": "2020-05-13"
  },
  {
    "tag_id": "HKR-19",
    "dob": "2020-07-27"
  },
  {
    "tag_id": "HKR-20",
    "dob": "2020-undefined-23"
  },
  {
    "tag_id": "HKR A-6",
    "dob": "2021-01-03"
  },
  {
    "tag_id": "HKR-21",
    "dob": "2021-06-12"
  },
  {
    "tag_id": "HKR-23",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "HKR-24",
    "dob": "2021-06-14"
  },
  {
    "tag_id": "HKR A-7",
    "dob": "2021-07-11"
  },
  {
    "tag_id": "HKR-25",
    "dob": "2021-09-5"
  },
  {
    "tag_id": "HKR-26",
    "dob": "2021-10-14"
  },
  {
    "tag_id": "HKR A-8",
    "dob": "2021-08-25"
  },
  {
    "tag_id": "HKR-27",
    "dob": "2021-12-10"
  },
  {
    "tag_id": "HKR-28",
    "dob": "2021-12-23"
  },
  {
    "tag_id": "PLM-1029",
    "dob": "2021-06-11"
  },
  {
    "tag_id": "UMI-1",
    "dob": "2021-06-11"
  },
  {
    "tag_id": "UMI-1030",
    "dob": "2020-11-11"
  },
  {
    "tag_id": "ALM-1",
    "dob": "2019-11-11"
  },
  {
    "tag_id": "ALM A-1",
    "dob": "2023-09-11"
  },
  {
    "tag_id": "ALM A-2",
    "dob": "2020-12-24"
  },
  {
    "tag_id": "DG-1",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "DG-2",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "DG-3",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "DG-4",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "DG-5",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "DG-6",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "DG-7",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "DG-8",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "DG-9",
    "dob": "2016-03-20"
  },
  {
    "tag_id": "DG A-1",
    "dob": "2016-06-02"
  },
  {
    "tag_id": "DG-A-2",
    "dob": "2017-05-02"
  },
  {
    "tag_id": "DG-10",
    "dob": "2017-05-10"
  },
  {
    "tag_id": "DG A-3",
    "dob": "2017-11-28"
  },
  {
    "tag_id": "DG-11",
    "dob": "2018-03-18"
  },
  {
    "tag_id": "DG-12",
    "dob": "2018-04-19"
  },
  {
    "tag_id": "DG-13",
    "dob": "2018-07-21"
  },
  {
    "tag_id": "DG-14",
    "dob": "2019-04-06"
  },
  {
    "tag_id": "DG-15",
    "dob": "2019-05-4"
  },
  {
    "tag_id": "DG-16",
    "dob": "2019-07-23"
  },
  {
    "tag_id": "DG A-4",
    "dob": "2021-05-16"
  },
  {
    "tag_id": "DG-17",
    "dob": "2021-07-26"
  },
  {
    "tag_id": "DG-18",
    "dob": "2021-11-11"
  },
  {
    "tag_id": "DG-19",
    "dob": "2021-12-12"
  },
  {
    "tag_id": "KGD-1022",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "KGD-1023",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "KGD-1",
    "dob": "2016-02-07"
  },
  {
    "tag_id": "KGD-2",
    "dob": "2016-02-07"
  },
  {
    "tag_id": "KGD-3",
    "dob": "2016-02-07"
  },
  {
    "tag_id": "KGD-4",
    "dob": "2016-02-07"
  },
  {
    "tag_id": "KGD-5",
    "dob": "2016-02-07"
  },
  {
    "tag_id": "KGD A-1",
    "dob": "2017-01-09"
  },
  {
    "tag_id": "KGD-6",
    "dob": "2017-02-25"
  },
  {
    "tag_id": "KGD-7",
    "dob": "2017-06-12"
  },
  {
    "tag_id": "KGD A-2",
    "dob": "2018-03-9"
  },
  {
    "tag_id": "KGD A-3",
    "dob": "2018-03-19"
  },
  {
    "tag_id": "KGD-8",
    "dob": "2018-04-10"
  },
  {
    "tag_id": "KGD A-4",
    "dob": "2018-07-2"
  },
  {
    "tag_id": "KGD-9",
    "dob": "2019-03-20"
  },
  {
    "tag_id": "KGD-A-5",
    "dob": "2019-05-10"
  },
  {
    "tag_id": "KGD-10",
    "dob": "2019-05-16"
  },
  {
    "tag_id": "KGD A-6",
    "dob": "2019-05-27"
  },
  {
    "tag_id": "KGD A-7",
    "dob": "2020-07-18"
  },
  {
    "tag_id": "KGD A-8",
    "dob": "2020-07-19"
  },
  {
    "tag_id": "KGD-11",
    "dob": "2021-02-23"
  },
  {
    "tag_id": "KGD A-9",
    "dob": "2021-03-24"
  },
  {
    "tag_id": "KGD-12",
    "dob": "2021-06-07"
  },
  {
    "tag_id": "KGD A-10",
    "dob": "2021-11-27"
  },
  {
    "tag_id": "KGM-1",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "KGM-2",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "KGM-3",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "KGM A-1",
    "dob": "2016-08-12"
  },
  {
    "tag_id": "KGM A-2",
    "dob": "2016-11-6"
  },
  {
    "tag_id": "KGM-4",
    "dob": "2017-12-26"
  },
  {
    "tag_id": "KGM-5",
    "dob": "2019-01-25"
  },
  {
    "tag_id": "KGM-6",
    "dob": "2020-12-16"
  },
  {
    "tag_id": "KGM-7 ",
    "dob": "2021-03-09"
  },
  {
    "tag_id": "KGM A-3",
    "dob": "2021-10-16"
  },
  {
    "tag_id": "KGM A-4",
    "dob": "2022-06-24"
  },
  {
    "tag_id": "KHL-1",
    "dob": "2016-09-11"
  },
  {
    "tag_id": "KHL-2",
    "dob": "2021-06-11"
  },
  {
    "tag_id": "KHL-3",
    "dob": "2021-06-11"
  },
  {
    "tag_id": "KHL-4",
    "dob": "2021-06-11"
  },
  {
    "tag_id": "KHL-5",
    "dob": "2023-09-11"
  },
  {
    "tag_id": "0",
    "dob": "2018-12-16"
  },
  {
    "tag_id": "KHL-6",
    "dob": "2018-12-16"
  },
  {
    "tag_id": "KHL-1043",
    "dob": "2021-06-11"
  },
  {
    "tag_id": "KHL-7",
    "dob": "2021-11-11"
  },
  {
    "tag_id": "KHL-8",
    "dob": "2021-11-11"
  },
  {
    "tag_id": "KHL-9",
    "dob": "2021-11-11"
  },
  {
    "tag_id": "KHL-10",
    "dob": "2021-11-11"
  },
  {
    "tag_id": "KHL-11",
    "dob": "2023-01-11"
  },
  {
    "tag_id": "KHL-12",
    "dob": "2021-02-24"
  },
  {
    "tag_id": "KHL A-2",
    "dob": "2022-11-2"
  },
  {
    "tag_id": "KHL-12",
    "dob": "2022-12-13"
  },
  {
    "tag_id": "KHL-13",
    "dob": "2022-12-31"
  },
  {
    "tag_id": "KHL-14",
    "dob": "2023-02-1"
  },
  {
    "tag_id": "KHL A-3",
    "dob": "2023-02-28"
  },
  {
    "tag_id": "LK-1",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "LK-2",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "LK-3",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "LK-4",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "LK-",
    "dob": "2011-01-1"
  },
  {
    "tag_id": "LK-5",
    "dob": "2023-03-27"
  }
];

const setCowBdayDB = async (req, res) => {

  try {

    let cowsNotFind = []
    let cowsUpdate = []

    for (var data of inputArray) {

      const findCow = await dbService.findOne(COW, { tag_id: data.tag_id });

      if (!findCow) {
        cowsNotFind.push({ tag_id: data.tag_id })
      } else {

        await dbService.updateOne(COW, { tag_id: data.tag_id }, { dob: data.dob })
        cowsUpdate.push({ tag_id: data.tag_id })

      }

    }
    return res.success({ cowsNotFind, cowsUpdate })

  } catch (error) {
    return res.internalServerError({ message: error.message });

  }

}

const updateCowTag = async (req, res) => {

  try {

    let cowsNotFind = []
    let cowsUpdate = []

    const inputArray = req.body.data

    for (var data of inputArray) {

      const findCow = await dbService.findOne(COW, { tag_id: data.tag_id });

      if (!findCow) {
        console.log("Error in tag : ", data.tag_id)
        cowsNotFind.push({ tag_id: data.tag_id })
      } else {

        await dbService.updateOne(COW, { tag_id: data.tag_id }, { tag_id: data.update_tag_id })
        cowsUpdate.push({ tag_id: data.tag_id })

      }

    }
    return res.success({ data: cowsNotFind, cowsUpdate })

  } catch (error) {
    return res.internalServerError({ message: error.message });

  }

}


module.exports = {
  updateCowTag,
  setCowBdayDB,
  setCowBdays,
  addApi_logs,
  findAllApi_logs,
  getApi_logs,
  getApi_logsCount
};