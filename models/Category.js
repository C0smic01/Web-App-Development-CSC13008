module.exports = (sequelize,DataTypes)=>{
    const Category = sequelize.define('categories', {
        category_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        category_name: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        timestamps: true, 
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });
    Category.associate = (models)=>{
        Category.belongsToMany(models.products,{
            foreignKey: {name :'category_id'},
            through : 'product_category',
            timestamps: false
        })
    }
    return Category
}