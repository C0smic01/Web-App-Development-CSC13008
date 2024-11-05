module.exports = (sequelize,DataTypes)=>{
    const Manufacturer = sequelize.define('manufacturers', {
        manufacturer_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        m_name: {
            type: DataTypes.STRING
        }
    }, {
        timestamps: false
    });
    Manufacturer.associate = (models)=>{
        Manufacturer.hasMany(models.products,{
            foreignKey: {name : 'manufacturer_id',allowNull : false}
        })
    }
    return Manufacturer
}