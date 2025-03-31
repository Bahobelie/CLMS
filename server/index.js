const cors = require('cors');
const app = require('./app');
const connectDb = require('./config/connectDb');
const { startFeeUpdateCronJob } = require('./services/feeService'); // Import the cron job service

// call function to connect db
connectDb;

// Start the cron job
startFeeUpdateCronJob();

app.listen(process.env.PORT, () => {
  console.log('Server started on port 5432');
});