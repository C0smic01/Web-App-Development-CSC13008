module.exports = (sequelize,DataTypes)=>{
    
    const Status = sequelize.define('Status', {
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
        timestamps: false,
        tableName : 'status'
    });
    Status.associate=  (models)=>{
        Status.hasMany(models.Product,{
            foreignKey : {name :'status_id', allowNull : false}
        })
        Status.belongsToMany(models.Order,{
            foreignKey: {name : 'order_id', allowNull: false},
            through : 'order_status'
        })
    }
    
    return Status
}