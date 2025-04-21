const cors = require('cors');
const app = require('./app');
const connectDb = require('./config/connectDb');
const { startFeeUpdateCronJob } = require('./services/feeService');
const express = require('express');
const { join } = require('node:path'); // Import the cron job service

// call function to connect db
connectDb;

// Start the cron job
startFeeUpdateCronJob();
// Serve static files with additional options
app.use('/uploads', express.static(join(__dirname, 'uploads')))


app.listen( 4000, () => {
  console.log(`Server started on port 4000`);
});