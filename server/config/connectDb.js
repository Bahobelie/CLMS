const path = require('path');
require('dotenv').config({path:path.resolve(__dirname,'..','.env')});
const {Pool} = require('pg');

// Debug: Check if env variables are loaded
console.log('Environment Variables:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // Mask password
  database: process.env.DB_NAME
});


const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,

});
(async ()=>{
  try {
    const res=await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully!', res.rows[0]);
  }
  catch(err){
  console.error('❌ Connection failed:', err);
  }
  finally {
    await pool.end();
  }
})();

module.exports= pool;

