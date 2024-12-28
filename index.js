const Sequelize = require('sequelize');
const sequelize = require('./config/database');

const User = require('./authentication/models/User')(sequelize, Sequelize.DataTypes);
const Role = require('./authentication/models/Role')(sequelize, Sequelize.DataTypes);
const UserRole = require('./authentication/models/UserRole')(sequelize, Sequelize.DataTypes);
const Manufacturer = require('./shop/models/Manufacturer')(sequelize, Sequelize.DataTypes);
const Status = require('./shop/models/Status')(sequelize, Sequelize.DataTypes);
const Product = require('./shop/models/Product')(sequelize, Sequelize.DataTypes);
const Category = require('./shop/models/Category')(sequelize, Sequelize.DataTypes);
const Review = require('./shop/models/Review')(sequelize, Sequelize.DataTypes);
const Order = require('./order/models/Order')(sequelize, Sequelize.DataTypes);
const OrderDetail = require('./order/models/OrderDetail')(sequelize, Sequelize.DataTypes);
const ProductImages = require('./shop/models/ProductImages')(sequelize, Sequelize.DataTypes);

Object.values(sequelize.models).forEach(model => {
  if (model.associate) {
    // console.log(`Associating model: ${model.name}`);
    model.associate(sequelize.models);
  }
});

const sampleData = require('./boot/createSample')
// Sync db
sequelize.sync({alter: true}).then(async()=>{
  console.log("Database & tables sync!");
  await sampleData.createCategorySample();
  await sampleData.createManufacturerSample();
  await sampleData.createRoleSample();
  await sampleData.createStatusSample();
  await sampleData.createProductSample();
  await sampleData.createUserSample();
  await sampleData.createProductCategorySample();
})

module.exports = {
  sequelize,
  User,
  Role,
  UserRole,
  Manufacturer,
  Status,
  Product,
  Category,
  Review,
  Order,
  OrderDetail,
  ProductImages
};
