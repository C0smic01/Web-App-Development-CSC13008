module.exports = (sequelize,DataTypes)=>{
    const Manufacturer = sequelize.define('Manufacturer', {
        manufacturer_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        m_name: {
            type: DataTypes.STRING
        }
    }, {
        timestamps: false,
        tableName: 'manufacturers'
    });
    Manufacturer.associate = (models)=>{
        Manufacturer.hasMany(models.Product,{
            foreignKey: {name : 'manufacturer_id',allowNull : false}
        })
    }
    return Manufacturer
}