
const mongoose = require('mongoose')

/**
 * Generates the next sequential ID with a given prefix.
 * @param {mongoose.Model} model - The Mongoose model.
 * @param {string} prefix - The prefix for the ID (e.g., "RO-").
 * @returns {Promise<string>} - The next generated ID.
 */
const generateNextId = async (model, prefix) => {
  const lastRecord = await model.findOne().sort({ _id: -1 }); // Find last record

  let nextCode = `${prefix}000001`; // Default starting ID

  if (lastRecord) {
    const lastIdNum = parseInt(lastRecord.code.split("-")[1]); // Extract number
    const newIdNum = lastIdNum + 1;
    nextCode = `${prefix}${String(newIdNum).padStart(5, "0")}`; // Format with leading zeros
  }

  return nextCode;
};

module.exports= generateNextId;
