module.exports = (sequelize,DataTypes)=>{
    
    const Product = sequelize.define('products', {
        product_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        product_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        img : {
            type : DataTypes.STRING,
            allowNull : true
        },
        remaining: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0, 
            }
        },
        status_id :{
            type : DataTypes.INTEGER,
            allowNull : true
        },
        manufacturer_id :{
            type : DataTypes.INTEGER,
            allowNull : true
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
    Product.associate = (models)=>{
        Product.belongsToMany(models.users,{
            foreignKey: {name :'product_id'},
            as : 'product_review',
            through : 'reviews'
        }),
        Product.belongsTo(models.status,{
            foreignKey: {name :'status_id'}
        }),
        Product.belongsTo(models.manufacturers,{
            foreignKey : {name : 'manufacturer_id'},
        }),
        Product.belongsToMany(models.categories,{
            foreignKey: {name :'product_id'},
            through : 'product_category',
            timestamps: false
        })
    }
    return Product
}