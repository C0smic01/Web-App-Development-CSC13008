module.exports = (sequelize,DataTypes)=>{
    
    const OrderStatus = sequelize.define('order_status', {
        status_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        order_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        }
    }, {
        timestamps: false,
        tableName :'order_status'
    });
    
    return OrderStatus
}