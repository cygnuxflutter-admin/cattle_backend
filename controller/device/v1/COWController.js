const COW = require('../../../model/COW');
const ShedTransferHistory = require('../../../model/shedTransferHistory');
const COWSchemaKey = require('../../../utils/validation/COWValidation');
const shedTransferHistorySchemaKey = require('../../../utils/validation/shedTransferHistoryValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const common = require('../../../utils/common');
const MILK = require('../../../model/milk');


const removeDuplicate = async (req, res) => {
  const tagIdsToRemove = req.body.tag_id;
  try {
    // const tagIdToRemove = req.body.tag_id;
    // if (!tagIdToRemove || isNaN(tagIdToRemove)) {
    //   return res.status(400).json({ error: 'Invalid tag_id provided' });
    // }

    const gaushala_id = req.user.gaushala_id


    for (let tagId = 0; tagId < 1610; tagId++) {
      // Remove all duplicates for the specified tag_id except the first one
      const duplicates = await COW.find({ tag_id: tagId, gaushala_id: gaushala_id });
      if (duplicates.length <= 1) {
        //successMessages.push(`No duplicates found or only one record exists for tag_id: ${tagId}`);
      } else {
        try {
          const idsToRemove = duplicates.slice(1).map((duplicate) => duplicate._id);
          await COW.deleteMany({ _id: { $in: idsToRemove } });
          //  successMessages.push(`Duplicates removed successfully for tag_id: ${tagId}`);
        } catch (err) {
          //errorMessages.push(`Failed to remove duplicates for tag_id: ${tagId}`);
        }
      }
    }

    //Remove all duplicates for the specified tag_id except the first one
    // const duplicates = await COW.find({ tag_id: "C-314" });
    // if (duplicates.length <= 1) {
    //   return res.status(200).json({ message: 'No duplicates found or only one record exists for the tag_id' });
    // }

    // const idsToRemove = duplicates.slice(1).map((duplicate) => duplicate._id);
    // await COW.deleteMany({ _id: { $in: idsToRemove } });

    return res.status(200).json({ message: 'Duplicates removed successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }

}

function parseToInt(stringParse) {

  let parsedInt = parseInt(stringParse);

  if (!isNaN(parsedInt)) {
    return parsedInt;
  }

  return stringParse;

}

const cowTransfer = async (req, res) => {
  try {

    if (!req.body.cowId) {
      res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }

    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      shedTransferHistorySchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }

    // const query = { tag_id :req.body.cowId };

    const v1 = (req.body.cowId)
    let updatedCOW = '';
    const gaushala_id = req.user.gaushala_id
    const parsedInt = parseInt(v1);

    if (!isNaN(parsedInt)) {
      updatedCOW = await dbService.updateOne(COW, { tag_id: parsedInt, gaushala_id: gaushala_id }, { shed_id: req.body.newShed, type: req.body.cowType });
      if (!updatedCOW) {
        updatedCOW = await dbService.updateOne(COW, { tag_id: req.body.cowId, gaushala_id: gaushala_id }, { shed_id: req.body.newShed, type: req.body.cowType });
        if (!updatedCOW) {
          return res.recordNotFound();
        }

      }
    } else {
      updatedCOW = await dbService.updateOne(COW, { tag_id: req.body.cowId, gaushala_id: gaushala_id }, { shed_id: req.body.newShed, type: req.body.cowType });
      if (!updatedCOW) {
        return res.recordNotFound();
      }
    }

    dataToCreate = new ShedTransferHistory(dataToCreate);
    // let createdShedTransferHistory = await dbService.create(ShedTransferHistory,dataToCreate);
    await dbService.create(ShedTransferHistory, dataToCreate);

    return res.success({ data: updatedCOW });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : create document of COW in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created COW. {status, message, data}
 */
const addCOW = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let foundCOW = '';
    let options = '';
    const gaushala_id = req.user.gaushala_id

    foundCOW = await dbService.findOne(COW, { tag_id: parseToInt(req.body.tag_id), gaushala_id: gaushala_id }, options);

    if (foundCOW === null) {
      foundCOW = await dbService.findOne(COW, { tag_id: req.body.tag_id, gaushala_id: gaushala_id }, options);
    }
    if (foundCOW) {
      return res.validationError({ message: `A record with tag_id '${dataToCreate.tag_id}' already exists.` });
    }

    if (dataToCreate.dob == "") {
      dataToCreate.dob = "2021-01-01";
    }

    const isValidDob = common.isValidDateFormat(dataToCreate.dob);
    if (isValidDob != true) {
      return res.validationError({ message: `Invalid date format in dob` });
    }

    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      COWSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    dataToCreate.addedBy = req.user.user_id;
    dataToCreate.gaushala_id = req.user.gaushala_id

    dataToCreate = new COW(dataToCreate);
    let createdCOW = await dbService.create(COW, dataToCreate);
    return res.success({ data: createdCOW });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const getCowLsatID = async (req, res) => {
  try {

    const gaushala_id = req.query.gaushala_id;

    if (!gaushala_id) {
      return res.badRequest({ message: "gaushala_id is required" });
    }

    const lastCow = await COW
      .findOne({ gaushala_id: gaushala_id })
      .sort({ _id: -1 });

    if (!lastCow) {
      return res.recordNotFound({ message: "No cow found" });
    }

    return res.success({ data: lastCow.tag_id });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};


/**
 * @description : create multiple documents of COW in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created COWs. {status, message, data}
 */

// const bulkUpdateCOW = async (req, res) => {

//   try {
//     const result = await COW.updateMany(
//       { gaushala_id: "01" },        // filter
//       { $set: { shed_id: "Old Shed" } } // update
//     );

//     res.json({
//       status: true,
//       message: "Shed updated successfully",
//       modifiedCount: result.modifiedCount,
//     });
//   } catch (error) {
//     console.error("Update Error:", error);
//     res.status(500).json({
//       status: false,
//       message: "Something went wrong",
//       error: error.message,
//     });
//   }
// }


const bulkInsertCOW = async (req, res) => {
  try {
    if (req.body && (!Array.isArray(req.body.data) || req.body.data.length < 1)) {
      return res.badRequest();
    }
    let dataToCreate = [...req.body.data];
    for (let i = 0; i < dataToCreate.length; i++) {
      dataToCreate[i] = {
        ...dataToCreate[i],
        addedBy: req.user.id
      };
    }
    let createdCOWs = await dbService.create(COW, dataToCreate);
    createdCOWs = { count: createdCOWs ? createdCOWs.length : 0 };
    return res.success({ data: { count: createdCOWs.count || 0 } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find all documents of COW from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found COW(s). {status, message, data}
 */
const findAllCOW = async (req, res) => {
  try {
    const reqBody = {
      "query": {},
      "options": {
        "select": [
          "breed",
          "type",
          "shed_id",
          "tag_id",
          "calf_name",
          "isFemale",
          "createdAt",
          "dob"
        ],
        "collation": "",
        "sort": "",
        "populate": "",
        "projection": "",
        "lean": false,
        "leanWithId": true,
        "offset": 0,
        "page": 1,
        "limit": 2000,
        "pagination": false,
        "useEstimatedCount": false,
        "useCustomCountFn": false,
        "forceCountFn": false,
        "read": {},
        "options": {}
      },
      "isCountOnly": false
    };

    let options = reqBody.options;
    let query = reqBody.query;
    query.gaushala_id = req.user.gaushala_id;

    if (Array.isArray(req.body.type) && req.body.type.length > 0) {
      // Add an type condition using $in to match any of the specified values
      query.type = {
        $in: req.body.type,
      };
    }


    if (Array.isArray(req.body.shed_id) && req.body.shed_id.length > 0) {
      // Add an shed_id condition using $in to match any of the specified values
      query.shed_id = {
        $in: req.body.shed_id,
      };
    }

    let validateRequest = validation.validateFilterWithJoi(
      reqBody,
      COWSchemaKey.findFilterKeys,
      COW.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof reqBody.query === 'object' && reqBody.query !== null) {
      query = { ...reqBody.query };
    }
    if (reqBody.isCountOnly) {
      let totalRecords = await dbService.count(COW, query);
      return res.success({ data: { totalRecords } });
    }
    if (reqBody && typeof reqBody.options === 'object' && reqBody.options !== null) {
      options = { ...reqBody.options };
    }
    let foundCOWs = await dbService.paginate(COW, query, options);
    if (!foundCOWs || !foundCOWs.data || !foundCOWs.data.length) {
      return res.recordNotFound();
    }
    return res.success({ data: foundCOWs });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find document of COW from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found COW. {status, message, data}
 */
// retuns latest dob
function getLatestDOB(dataArray) {
  if (!dataArray || dataArray.length === 0) {
    return ''; // Return blank if the array is empty or not provided
  }

  let latestDOB = dataArray[0].dob; // Initialize with the first element's dob

  // Loop through the array to find the latest dob
  for (const item of dataArray) {
    if (item.dob > latestDOB) {
      latestDOB = item.dob;
    }
  }
  return latestDOB;
}

const getCOW = async (req, res) => {
  try {
    // let query = {}; 
    // if (!ObjectId.isValid(req.params.id)) {
    //   return res.validationError({ message : 'invalid objectId.' });
    // }
    // query._id = req.params.id;

    if (!req.body.tag_id) {
      return res.badRequest({ message: 'Insufficient request parameters! tag id is required.' });
    }

    let options = {};
    let foundCOW = '';
    const gaushala_id = req.user.gaushala_id

    foundCOW = await dbService.findOne(COW, { tag_id: (req.body.tag_id), gaushala_id: gaushala_id }, options);

    if (foundCOW === null) {
      foundCOW = await dbService.findOne(COW, { tag_id: req.body.tag_id, gaushala_id: gaushala_id }, options);
    }

    if (!foundCOW) {
      return res.recordNotFound();
    }

    let cowCalfs = await COW.find({ dam_id: req.body.tag_id, gaushala_id: gaushala_id });

    const latestCalfdob = getLatestDOB(cowCalfs);

    return res.success({ data: { foundCOW, latestCalfdob } });
  }
  catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : returns total number of documents of COW.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getCOWCount = async (req, res) => {
  try {
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      COWSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedCOW = await dbService.count(COW, where);
    return res.success({ data: { count: countedCOW } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update document of COW with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated COW.
 * @return {Object} : updated COW. {status, message, data}
 */
const updateCOW = async (req, res) => {
  try {
    let dataToUpdate = {
      ...req.body,
      updatedBy: req.user.id,
    };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      COWSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id
    let updatedCOW = await dbService.updateOne(COW, query, dataToUpdate);
    if (!updatedCOW) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedCOW });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update multiple records of COW with data by filter.
 * @param {Object} req : request including filter and data in request body.
 * @param {Object} res : response of updated COWs.
 * @return {Object} : updated COWs. {status, message, data}
 */
const bulkUpdateCOW = async (req, res) => {
  try {
    let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
    let dataToUpdate = {};
    delete dataToUpdate['addedBy'];
    if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
      dataToUpdate = {
        ...req.body.data,
        updatedBy: req.user.id
      };
    }
    let updatedCOW = await dbService.updateMany(COW, filter, dataToUpdate);
    if (!updatedCOW) {
      return res.recordNotFound();
    }
    return res.success({ data: { count: updatedCOW } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : partially update document of COW with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated COW.
 * @return {obj} : updated COW. {status, message, data}
 */
const partialUpdateCOW = async (req, res) => {
  try {
    if (!req.params.id) {
      res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    delete req.body['addedBy'];
    let dataToUpdate = {
      ...req.body,
      updatedBy: req.user.id,
    };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      COWSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id
    let updatedCOW = await dbService.updateOne(COW, query, dataToUpdate);
    if (!updatedCOW) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedCOW });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};
/**
 * @description : deactivate document of COW from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of COW.
 * @return {Object} : deactivated COW. {status, message, data}
 */
const softDeleteCOW = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id
    const updateBody = {
      isDeleted: true,
      updatedBy: req.user.id,
    };
    let updatedCOW = await dbService.updateOne(COW, query, updateBody);
    if (!updatedCOW) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedCOW });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : delete document of COW from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted COW. {status, message, data}
 */
const deleteCOW = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let query = { _id: req.params.id };
    query.gaushala_id = req.user.gaushala_id
    const deletedCOW = await dbService.deleteOne(COW, query);
    if (!deletedCOW) {
      return res.recordNotFound();
    }
    return res.success({ data: deletedCOW });

  }
  catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : delete documents of COW in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of documents deleted.
 * @return {Object} : no of documents deleted. {status, message, data}
 */
const deleteManyCOW = async (req, res) => {
  try {
    let ids = req.body.ids;
    if (!ids || !Array.isArray(ids) || ids.length < 1) {
      return res.badRequest();
    }
    let query = { _id: { $in: ids } };
    query.gaushala_id = req.user.gaushala_id
    const deletedCOW = await dbService.deleteMany(COW, query);
    if (!deletedCOW) {
      return res.recordNotFound();
    }
    return res.success({ data: { count: deletedCOW } });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};
/**
 * @description : deactivate multiple documents of COW from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated documents of COW.
 * @return {Object} : number of deactivated documents of COW. {status, message, data}
 */
const softDeleteManyCOW = async (req, res) => {
  try {
    let ids = req.body.ids;
    if (!ids || !Array.isArray(ids) || ids.length < 1) {
      return res.badRequest();
    }
    let query = { _id: { $in: ids } };
    query.gaushala_id = req.user.gaushala_id
    const updateBody = {
      isDeleted: true,
      updatedBy: req.user.id,
    };
    let updatedCOW = await dbService.updateMany(COW, query, updateBody);
    if (!updatedCOW) {
      return res.recordNotFound();
    }
    return res.success({ data: { count: updatedCOW } });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const checkTagIds = async (req, res) => {
  try {
    // Get the tag_ids from the request query parameter
    const { tag_ids } = req.body;

    // // Convert tag_ids to an array of strings
    // const tagIdsArray = utils.parseTagIds(tag_ids);

    // if (tagIdsArray.length === 0) {
    //   return res.status(400).json({ error: 'Invalid tag_ids format' });
    // }

    // // Query the database to find cows with matching tag_ids
    // const cows = await COW.find({ tag_id: { $in: tagIdsArray } });

    // Create an array of existing tag_ids
    let existingTagIds = [];

    // Find the missing tag_ids
    let missingTagIds = [];

    ///////////////////////////////
    let foundCOW = await dbService.findAll(COW, { gaushala_id: req.user.gaushala_id });

    // Iterate through each tag_id and find matching COW objects
    for (const tag_id of tag_ids) {
      const matches = foundCOW.filter((cow) => cow.tag_id == tag_id);
      if (matches.length > 0) {

        existingTagIds.push(...matches);
      } else {

        missingTagIds.push(tag_id);
      }
    }

    // Respond with the result
    res.json({ existingTagIds, missingTagIds });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const uploadCowImage = async (req, res) => {
  try {

    const cowId = req.body.id
    const gaushala_id = req.user.gaushala_id;

    const findCow = await dbService.findOne(COW, { _id: cowId, gaushala_id: gaushala_id });

    if (!findCow) {
      return res.recordNotFound();
    }

    const folderName = `${findCow.tag_id}-${findCow.calf_name}-${cowId}`

    const filePaths = common.saveImagesLocally(req.files);
    const urls = await common.uploadImagesToS3(filePaths, folderName);
    common.deleteLocalImages(filePaths);

    const updateCow = await dbService.updateOne(COW, { _id: cowId, gaushala_id: gaushala_id }, { avatarUrl: urls[0] });

    return res.success({ data: updateCow });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const updateSendDiedCows = async (req, res) => {
  try {
    const cowList = req.body.data || [];
    const successCowIds = [];
    const errorCowIds = [];

    for (var cow of cowList) {
      let dataToUpdate = {};
      const cowId = cow.tag_id.toString();

      const remark = cow.send_died_date || '';
      const remark2 = cow.remark || '';

      const remark3 = `${remark2}-${remark}`;
      let date = 'NA';
      if (cow.date != "NA") {
        date = convertDateFormat(cow.date)

        dataToUpdate.send_died_date = date;
      }

      if (dataToUpdate.send_died_date == undefined) {
        dataToUpdate.send_died_date = "NA"
      }

      dataToUpdate.remark = remark3;
      dataToUpdate.type = cowType(remark2);

      if (cow.name != "NA") {
        dataToUpdate.calf_name = cow.name
      }

      console.log("dataToUpdate : " + dataToUpdate.send_died_date);

      try {
        if (cow.date != "NA") {
          const foundCow = await dbService.updateOne(COW, { tag_id: cowId });

          if (foundCow) {
            await dbService.updateOne(COW, { tag_id: cowId }, dataToUpdate);
            successCowIds.push(cowId);
          } else {
            errorCowIds.push({ cowId, cowIdNotFound: "cowId Not Found In DB" });
          }
        } else {
          errorCowIds.push({ cowId, error: "dont update" });
        }
      } catch (updateError) {
        // If an error occurs during update, add cowId to errorCowIds array
        errorCowIds.push({ cowId, error: updateError.message });
      }
    }

    return res.success({ data: { successCowIds, errorCowIds } });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

function convertDateFormat(inputDate) {
  // Split the input date into day, month, and year
  const dateComponents = inputDate.split('-');

  // Rearrange the components to form the desired output format
  const outputDate = `${dateComponents[2]}-${dateComponents[1].padStart(2, '0')}-${dateComponents[0].padStart(2, '0')}`;

  return outputDate;
}

function cowType(type) {

  if (type == "") {
    type = ""
    return type
  } else if (type == "DIED") {
    type = "Died"
    return type
  } else if (type == "DONATION") {
    type = "Donate"
    return type
  } else if (type == "SEMEN") {
    type = "Semen"
    return type
  }

}



const MAX_DEPTH = 100; // Set your desired maximum depth

async function getFamilyHierarchy(tagId, gaushala_id, depth = 0) {
  try {
    const cow = await COW.findOne({ "tag_id": tagId, "gaushala_id": gaushala_id });

    if (!cow) {
      console.log("Cow not found");
      return null;
    }

    const cowFamily = {
      cowId: tagId,
      calfName: cow.calf_name,
      gender: cow.isFemale == true ? 'Female' : 'Male',
      birthDate: cow.dob,
      type: cow.type,
      breed: cow.breed,
      motherId: cow.dam_id,
      fatherId: cow.sair_id,
      parents: [],
    };

    // Recursively fetch and add the hierarchy
    if (depth < MAX_DEPTH) {
      const motherData = await printFamilyHierarchy(cow.dam_id, "Mother", depth + 1, gaushala_id);
      const fatherData = await printFamilyHierarchy(cow.sair_id, "Father", depth + 1, gaushala_id);

      // Filter out null values
      cowFamily.parents = [motherData, fatherData].filter(data => data !== null);
    }

    return cowFamily;

  } catch (error) {
    console.log(error);
    throw error; // Rethrow the error for handling in the calling function
  }
}

async function printFamilyHierarchy(parentId, relationship, depth, gaushala_id) {
  if (parentId === "NA" || depth >= MAX_DEPTH) {
    return null;
  }

  const parent = await COW.findOne({ "tag_id": parentId, "gaushala_id": gaushala_id });

  if (!parent) {
    return null;
  }

  const family = {
    cowId: parent.tag_id,
    calfName: parent.calf_name,
    gender: parent.isFemale == true ? 'Female' : 'Male',
    birthDate: parent.dob,
    type: parent.type,
    breed: parent.breed,
    motherId: parent.dam_id,
    fatherId: parent.sair_id,
    parents: [],
  };

  // Recursively fetch and add the hierarchy
  if (depth + 1 < MAX_DEPTH) {
    const motherData = await printFamilyHierarchy(parent.dam_id, `Grand ${relationship}`, depth + 1, gaushala_id);
    const fatherData = await printFamilyHierarchy(parent.sair_id, `Grand ${relationship}`, depth + 1, gaushala_id);

    // Filter out null values
    family.parents = [motherData, fatherData].filter(data => data !== null);
  }

  return family;
}


function getMatchingTagIds(cowsData) {
  const matchingTagIds = [];

  cowsData.forEach((cow) => {
    if (cow.tag_id === cow.dam_id || cow.tag_id === cow.sair_id) {
      matchingTagIds.push(cow.tag_id);
    }
  });

  return matchingTagIds;
}

const getCowFamily = async (req, res) => {
  try {
    const tag_id = req.body.tag_id;
    const gaushala_id = req.user.gaushala_id;
    const cowFamily = await getFamilyHierarchy(tag_id, gaushala_id);

    // Filter out null values
    const filteredCowFamily = filterNullValues(cowFamily);

    if (!filteredCowFamily) {
      return res.recordNotFound({ message: "Cow not found" });
    }

    return res.success({ data: filteredCowFamily });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

function filterNullValues(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.filter(item => item !== null).map(filterNullValues);
  }

  return Object.fromEntries(
    Object.entries(obj)
      .map(([key, value]) => [key, filterNullValues(value)])
      .filter(([key, value]) => value !== null)
  );
}


// New API to get children details where given a cow ID, it returns family info of its children (matching dam_id or sire_id)
const getChildrenDetails = async (req, res) => {
  try {
    const tag_id = req.body.tag_id;
    const gaushala_id = req.user.gaushala_id;

    // Find children where dam_id or sire_id matches the given tag_id
    const children = await COW.find({
      $or: [{ dam_id: tag_id }, { sire_id: tag_id }],
      gaushala_id,
    });

    if (!children || children.length === 0) {
      return res.recordNotFound({ message: "No children found for the given cow ID" });
    }

    // For each child, fetch its full family hierarchy
    const childrenDetails = await Promise.all(
      children.map((c) => getFamilyHierarchy(c.tag_id, gaushala_id))
    );

    // Filter out null values from hierarchy results
    const filteredChildren = childrenDetails.map(filterNullValues);

    return res.success({ data: filteredChildren });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const getCowsMilkInfo = async (req, res) => {
  try {

    let query = {};
    const tag_id = req.body.tag_id;
    const gaushala_id = req.user.gaushala_id;

    const findCow = await dbService.findOne(COW, { tag_id, gaushala_id });
    if (!findCow) {
      return res.recordNotFound({ message: "Cow not found" });
    }

    if (findCow.isFemale == false) {
      return res.recordNotFound({ message: "This is bull cattle" });
    }

    query.gaushala_id = gaushala_id;
    query.cow_tag_id = tag_id;

    const { startMonthYear, endMonthYear } = getLastYearMonths();

    const lastYearpipeline = [
      {
        $match: {
          ...query,
          date: { $gte: startMonthYear, $lte: endMonthYear } // Filter by date greater than or equal to last year's start date
        }
      },
      {
        $group: {
          _id: '$cow_tag_id',
          totalLiter: { $sum: '$liter' },
        }
      }
    ];

    const currentYearpipeline = [
      {
        $match: {
          ...query,
          date: { $gte: getCurrentYearDates().startMonthYear, $lte: getCurrentYearDates().endMonthYear } // Filter by date greater than or equal to last year's start date
        }
      },
      {
        $group: {
          _id: '$cow_tag_id',
          totalLiter: { $sum: '$liter' },
        }
      }
    ];

    const lastYearTotalMilk = await MILK.aggregate(lastYearpipeline);
    const currentYearTotalMilk = await MILK.aggregate(currentYearpipeline);

    const last = common.convertToDouble(lastYearTotalMilk[0]?.totalLiter);
    const current = common.convertToDouble(currentYearTotalMilk[0]?.totalLiter);


    // Calculate the total
    const total = last + current;

    const milkData = {
      'currentYearTotalMilk': current,
      'lastYearTotalMilk': last,
      'TotalMilk': total,
    }


    return res.success({ data: milkData });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};


function getLastYearMonths() {
  const currentDate = new Date();
  const lastYearStartDate = new Date(currentDate.getFullYear() - 1, 0, 1); // Start of last year
  const lastYearEndDate = new Date(currentDate.getFullYear(), 0, 0); // End of last year (last day of previous year)

  const startDate = lastYearStartDate.toISOString().split('T')[0]; // Extracting YYYY-MM-DD
  const endDate = lastYearEndDate.toISOString().split('T')[0];

  const startMonthYear = `${startDate}`;
  const endMonthYear = `${endDate}`;

  return { startMonthYear, endMonthYear };
}

function getCurrentYearDates() {
  const currentDate = new Date();
  const currentYearStartDate = new Date(currentDate.getFullYear(), 0, 1); // Start of current year
  const currentYearEndDate = new Date(currentDate.getFullYear() + 1, 0, 0); // End of current year (last day of current year)

  const startDate = currentYearStartDate.toISOString().split('T')[0]; // Extracting YYYY-MM-DD
  const endDate = currentYearEndDate.toISOString().split('T')[0];

  const startMonthYear = `${startDate}`;
  const endMonthYear = `${endDate}`;

  return { startMonthYear, endMonthYear };
}

const getSairFamily = async (req, res) => {
  try {
    const gaushala_id = req.user.gaushala_id;

    const sair_id = req.body.sair_id;
    const cows = await COW.find({ gaushala_id: gaushala_id, sair_id: sair_id }).select({ 'calf_name': 1, 'tag_id': 1, 'isFemale': 1, 'type': 1 });

    return res.success({ data: cows });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const updateCowDod = async (req, res) => {
  try {
    const dataToUpdate = req.body.data;
    const errorTags = [];
    const successTags = [];

    for (var data of dataToUpdate) {

      const tag_id = data.tag_id.toString();
      const findCow = await dbService.findOne(COW, { tag_id: tag_id });
      if (!findCow) {
        errorTags.push(tag_id);
        console.log("error", tag_id)

      } else {
        const cowDob = data.dob;
        await dbService.updateOne(COW, { tag_id: tag_id }, { dob: cowDob })
        console.log("success", tag_id)
        successTags.push(tag_id);
      }
    }

    return res.success({ data: { errorTags, successTags } })

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const manualCowAdd = async (req, res) => {
  try {

    const cowList = req.body.data;
    const errorCowIds = [];
    const successCowIds = [];
    let dataToCreate = {};

    for (var cow of cowList) {

      const tag_id = cow.tag_id.toString();
      const findCow = await dbService.findOne(COW, { tag_id: tag_id, gaushala_id: "01" });
      dataToCreate = cow;


      if (!findCow) {

        let foundCOW = '';
        let options = '';

        const gaushala_id = "01"

        dataToCreate.dam_id = cow.dam_id.toString();
        dataToCreate.sair_id = cow.sair_id.toString();
        dataToCreate.isFemale = cow.isFemale == 'M' ? false : true;
        let validateRequest = validation.validateParamsWithJoi(
          dataToCreate,
          COWSchemaKey.schemaKeys);
        if (!validateRequest.isValid) {
          errorCowIds.push({ message: `A record with tag_id '${dataToCreate.tag_id}' already exists.`, data: `Invalid values in parameters, ${validateRequest.message}` });
          //return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }
        dataToCreate.addedBy = "DB-1";
        dataToCreate.gaushala_id = "01"


        dataToCreate = new COW(dataToCreate);
        await dbService.create(COW, dataToCreate);


        console.log('successCowIds', tag_id)
        successCowIds.push(tag_id)
      } else {

        console.log('errorCowIds', tag_id)
        errorCowIds.push({ message: `A record with tag_id '${dataToCreate.tag_id}' already exists.` });

      }


    }

    return res.success({ data: { errorCowIds, successCowIds } })

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const updateDamSair = async (req, res) => {
  try {
    const dataToUpdate = req.body.data;
    const errorTags = [];
    const successTags = [];
    const oldTagIds = [];

    for (var data of dataToUpdate) {

      const tag_id = data.tag_id.toString();
      const id = data._id;
      const findCow = await dbService.findOne(COW, { _id: ObjectId(id), gaushala_id: '02' })
      //const findCow = await dbService.findOne(COW, { tag_id: tag_id });
      if (!findCow) {
        errorTags.push({ _id: id, tag_id: tag_id });
        console.log("error", tag_id, id)

      } else {

        oldTagIds.push({
          id,
          tag_id: findCow.tag_id.toString(),
          new_tag_id: data.new_tag.toString()
        })

        const breed = data.breed;
        const type = data.type;
        const shed_id = data.shed_id.toString();
        const new_tag = data.new_tag.toString();
        const dob = data.dob;
        const calf_name = data.calf_name;
        const isFemale = data.isFemale == 'FALSE' ? false : true;
        const calf_weight = data.calf_weight;
        const delivery_time = data.delivery_time;
        const send_died_date = data.send_died_date;
        const purchase_date = data.purchase_date;
        const remark = data.remark;
        const dam_id = data.dam_id.toString();
        const dam_name = data.dam_name.toString();
        const sair_id = data.sair_id.toString();
        const sair_name = data.sair_name.toString();

        const dataToUpdate = {
          tag_id: new_tag,
          breed,
          type,
          shed_id,
          dob,
          calf_name,
          isFemale,
          calf_weight,
          delivery_time,
          send_died_date,
          purchase_date,
          remark,
          dam_id,
          dam_name,
          sair_id,
          sair_name
        }

        await dbService.updateOne(COW, { _id: id }, dataToUpdate)
        await COW.updateOne({ _id: ObjectId(id) }, dataToUpdate)
        console.log("success", tag_id, id)
        successTags.push({ tag_id, id });
      }
    }

    return res.success({ data: { errorTags, successTags, oldTagIds } })

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const updateMilkAsPerNewTag02 = async (req, res) => {
  try {

    const dataToUpdate = req.body.data;
    const errorTags = [];
    const successTags = [];

    for (var data of dataToUpdate) {


      const old_tag_id = data.tag_id;
      const findCow = await dbService.findOne(MILK, { cow_tag_id: old_tag_id, gaushala_id: '02' })


      if (!findCow) {
        errorTags.push({ tag_id: old_tag_id });
        console.log("error", old_tag_id)
      } else {


        // for(var i = 0; i < findCow.length; i++) {

        //   const tag_id = findCow[i].cow_tag_id;

        //   const dataToUpdate = {
        //     cow_tag_id: data.new_tag
        //   }

        //   await dbService.updateOne(MILK, { cow_tag_id: tag_id }, dataToUpdate)



        //   console.log("success", tag_id)
        //   successTags.push({ tag_id });

        // }

        const dataToUpdate = {
          cow_tag_id: data.new_tag_id
        }

        const updateMany = await dbService.updateMany(MILK, { cow_tag_id: findCow.cow_tag_id }, dataToUpdate)
        console.log("success", updateMany, old_tag_id)
        successTags.push({ updateMany, old_tag_id });



      }

    }

    return res.success({ data: { errorTags, successTags } })

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }

}

module.exports = {
  updateDamSair,
  manualCowAdd,
  updateCowDod,
  getCowsMilkInfo,
  getCowFamily,
  getChildrenDetails,
  updateSendDiedCows,
  uploadCowImage,
  checkTagIds,
  removeDuplicate,
  cowTransfer,
  addCOW,
  getCowLsatID,
  bulkInsertCOW,
  findAllCOW,
  getCOW,
  getCOWCount,
  updateCOW,
  bulkUpdateCOW,
  partialUpdateCOW,
  softDeleteCOW,
  deleteCOW,
  getSairFamily,
  deleteManyCOW,
  softDeleteManyCOW,
  updateMilkAsPerNewTag02
};
