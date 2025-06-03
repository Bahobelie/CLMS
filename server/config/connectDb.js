const {Sequelize} = require('sequelize');
require('dotenv').config({path:__dirname+'/../.env'});


const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DATABASE_USERNAME,
    process.env.DATABASE_PASSWORD,
    {
      host: process.env.DATABASE_URL,
      dialect: 'postgres',
      port: process.env.DATABASE_PORT
    }
);

sequelize.authenticate().then(()=>{
  console.log('✅ Database connected successfully!');
}).catch((err)=>{
  console.error('❌ Connection failed:', err.message);
})

module.exports= sequelize;

