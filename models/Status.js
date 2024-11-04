const {DataTypes} = require('sequelize')
const sequelize = require('../config/database')

const Status = sequelize.define('status', {
    status_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    status_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    status_type: {
        type: DataTypes.ENUM("PRODUCT","ORDER"),
        allowNull: false,
    }
}, {
    timestamps: false
});

module.exports = Status