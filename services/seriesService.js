/** 
 * seriesService.js
 * @description :: exports function used in generating sequence for model attribute
 */

const dbService = require('../utils/dbService');
const sequence = require('../model/sequence');
const getNextSequenceString = async (modelName,attribute)=>{
  const seq = await dbService.findOne(sequence,{ 
    modelName,
    attribute 
  });
  const minLength = seq.startingPoint.length;
  const startingPointNumber = Number.parseInt(seq.startingPoint);
  const currentNumber = startingPointNumber + seq.totalEntry; 
  const currentNumberAsString = (currentNumber + '').padStart(minLength,'0');
  const sequenceString = `${seq.prefix}${currentNumberAsString}${seq.suffix}`;

  await dbService.updateOne(sequence,{
    modelName,
    attribute 
  },{ totalEntry:seq.totalEntry + 1 },{ returnOriginal:false });  

  return sequenceString;
};
module.exports = { getNextSequenceString };