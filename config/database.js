const { Sequelize } = require('sequelize');
const dotenv = require('dotenv')

dotenv.config({path:'./config.env'})

const sequelize = new Sequelize(process.env.PG_DATABASE, process.env.PG_USERNAME, process.env.PG_PASSWORD, {
    host: process.env.PG_HOST || 'localhost',
    dialect: 'postgres',
    logging: false,
});

module.exports = sequelize;