module.exports = (sequelize,DataTypes)=>{
    const Category = sequelize.define('Category', {
        category_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        category_name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        }
    }, {
        timestamps: true, 
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'categories'
    });
    Category.associate = (models)=>{
        Category.belongsToMany(models.Product,{
            foreignKey: 'category_id',
            through: 'product_category',
            as: 'products',
            timestamps: false,
            onDelete: 'CASCADE'
        })
    }
    return Category
}