const cron = require('node-cron');
const { patient } = require('./../models'); // Ensure correct model import
const { Op } = require('sequelize');

const updateExpiredApplicationFees = async () => {
  const expirationPeriod = new Date();
  expirationPeriod.setDate(expirationPeriod.getDate() - 30); // 30 days expiration

  try {
    const [affectedCount] = await patient.update(
      { application_fee: 'Expired' },
      {
        where: {
          application_fee: 'Active',
          created_at: {
            [Op.lte]: expirationPeriod
          }
        }
      }
    );

    console.log(`✅ Updated ${affectedCount} patients to "Expired" (created before ${expirationPeriod.toISOString()})`);
  } catch (error) {
    console.error('❌ Error updating expired application fees:', error);
  }
};

// Run daily at midnight (0 0 * * *)
const startFeeUpdateCronJob = () => {
  cron.schedule('0 0 * * *', updateExpiredApplicationFees, {
    scheduled: true,
    timezone: "America/New_York" // Set your timezone
  });
  console.log('🔄 Daily Application Fee Expiration Check Job Started');
};

module.exports = { startFeeUpdateCronJob };