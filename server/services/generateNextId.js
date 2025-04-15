const { Sequelize, Op } = require('sequelize');
const sequelize = require('../config/connectDb');

/**
 * Generates the next sequential ID with a given prefix.
 * @param {Sequelize.Model} model - The Sequelize model.
 * @param {string} prefix - The prefix for the ID (e.g., "RO-").
 * @returns {Promise<string>} - The next generated ID.
 */
const generateNextId = async (model, prefix) => {

  console.log(prefix);
  console.log(model);
  const lastRecord = await model.findOne({
    order: [['code', 'DESC']], // Order by code descending to get the last entry
    where: {
      code: {
        [Op.like]: `${prefix}%`, // Filter to get only codes with the prefix
      },
    },
  });

  let nextCode = `${prefix}000001`; // Default starting ID

  if (lastRecord) {
    const lastIdNum = parseInt(lastRecord.code.split("-")[1]); // Extract number
    const newIdNum = lastIdNum + 1;
    nextCode = `${prefix}${String(newIdNum).padStart(5, "0")}`; // Format with leading zeros
  }

  return nextCode;
};

module.exports = generateNextId;
