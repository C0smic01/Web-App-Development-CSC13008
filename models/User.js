const {DataTypes} = require('sequelize')
const sequelize = require('../config/database')

const User = sequelize.define('users', {
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
            isNumeric: true, 
            len: [10, 10], 
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true, 
        }
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    timestamps: true, 
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = User