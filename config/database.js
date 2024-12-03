const { Sequelize } = require('sequelize');
const dotenv = require('dotenv')

dotenv.config({path:'./config.env'})
const sequelize = new Sequelize(process.env.PG_DATABASE, process.env.PG_USERNAME, process.env.PG_PASSWORD, {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT || 11970,
    dialect: 'postgres',
    logging: false, 
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true,
        ca: process.env.PG_CERTS
      }
    }
})  
module.exports = sequelize;
 