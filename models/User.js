const bcrypt = require('bcryptjs');

module.exports = (sequelize,DataTypes)=>{
    
    const User = sequelize.define('User', {
        user_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [6, Infinity],
            }
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true
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
        tableName: 'users'
    });
    User.associate = (models)=>{
        User.hasMany(models.Review,{
            foreignKey : {name : 'user_id', allowNull : false},
            onDelete : 'CASCADE',
            as : 'user_review'
        }),
        User.belongsToMany(models.Role,{
            foreignKey : {name : 'user_id', allowNull : false},
            through : 'user_role'
        }),
        User.hasMany(models.Order,{
            foreignKey :{name : 'user_id',allowNull : false},
            onDelete : 'CASCADE'
        })
    }
    
    User.prototype.validatePassword = async function(password) {
        return await bcrypt.compare(password, this.password);
    };

    User.beforeCreate(async (user) => {
        if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 12);
        }
    });

    User.beforeUpdate(async (user) => {
        if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 12);
        }
    });
    
    return User
}