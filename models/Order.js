module.exports = (sequelize,DataTypes)=>{
    const Order = sequelize.define('orders', {
        order_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        total: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });
    
    Order.associate = (models)=>{
        Order.belongsTo(models.users,{
            foreignKey : {name : 'user_id', allowNull : false}
        })
        Order.hasMany(models.order_details,{
            foreignKey: {name : 'order_id',allowNull : false}
        })
        Order.belongsToMany(models.status,{
            foreignKey : {name : 'order_id',allowNull: false},
            through : 'order_status'
        })
    }
    return Order
}