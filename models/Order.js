module.exports = (sequelize,DataTypes)=>{
    const Order = sequelize.define('Order', {
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
        updatedAt: false,
        tableName: 'orders'
    });
    
    Order.associate = (models)=>{
        Order.belongsTo(models.User,{
            foreignKey : {name : 'user_id', allowNull : false}
        })
        Order.hasMany(models.OrderDetails,{
            foreignKey: {name : 'order_id',allowNull : false}
        })
        Order.belongsToMany(models.Status,{
            foreignKey : {name : 'order_id',allowNull: false},
            through : 'order_status'
        })
    }
    return Order
}