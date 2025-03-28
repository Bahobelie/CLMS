const cors = require('cors');
 const app=require('./app');
const connectDb=require('./config/connectDb');
 const { startFeeUpdateCronJob } = require("./services/feeService"); // Import the cron job service
// Enable CORS for all origins
connectDb(); // call function to connect db

 // Start the cron job
 startFeeUpdateCronJob();
app.listen(process.env.PORT,()=>{
  console.log("Server started on port 8080");
});