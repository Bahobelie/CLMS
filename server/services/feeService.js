const cron = require("node-cron");
const Patient = require("./../models/patientSchema"); // Adjust the path as needed

const updateExpiredApplicationFees = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    // Find and update all records where applicationFee is "Paid" and paidAt is older than 30 days
    const result = await Patient.updateMany(
      { applicationFee: "Paid", createdAt: { $lte: thirtyDaysAgo } },
      { $set: { applicationFee: "Unpaid" } }
    );


    console.log(`Updated ${result.modifiedCount} patients to Unpaid`);
  } catch (error) {
    console.error("❌ Error updating expired application fees:", error);
  }
};

// Run the cron job every day at midnight
const startFeeUpdateCronJob = () => {
  cron.schedule("0 0 * * *", updateExpiredApplicationFees);
  console.log("🔄 Application Fee Auto-Update Cron Job Started ✅");
};

// Export the function
module.exports = { startFeeUpdateCronJob };
