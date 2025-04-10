const cors = require('cors');
const app = require('./app');
const connectDb = require('./config/connectDb');
const { startFeeUpdateCronJob } = require('./services/feeService'); // Import the cron job service

// call function to connect db
connectDb;

// Start the cron job
startFeeUpdateCronJob();

app.listen( 4000, () => {
  console.log(`Server started on port 4000`);
});