module.exports = (sequelize, DataTypes) => {
    const ProductImages = sequelize.define('ProductImages', {
        image_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'products',
                key: 'product_id'
            }
        },
        image_path: {
            type: DataTypes.STRING,
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'product_images'
    });

    ProductImages.associate = (models) => {
        ProductImages.belongsTo(models.Product, {
            foreignKey: 'product_id',
            onDelete: 'CASCADE'
        });
    };

    return ProductImages;
};