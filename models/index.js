const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User')(sequelize, Sequelize.DataTypes);
const Role = require('./Role')(sequelize, Sequelize.DataTypes);
const UserRole = require('./UserRole')(sequelize, Sequelize.DataTypes);
const Manufacturer = require('./Manufacturer')(sequelize, Sequelize.DataTypes);
const Status = require('./Status')(sequelize, Sequelize.DataTypes);
const Product = require('./Product')(sequelize, Sequelize.DataTypes);
const Category = require('./Category')(sequelize, Sequelize.DataTypes);
const Review = require('./Review')(sequelize, Sequelize.DataTypes);
const Order = require('./Order')(sequelize, Sequelize.DataTypes);
const OrderDetail = require('./OrderDetail')(sequelize, Sequelize.DataTypes);

Object.values(sequelize.models).forEach(model => {
  if (model.associate) {
    // console.log(`Associating model: ${model.name}`);
    model.associate(sequelize.models);
  }
});

const sampleData = require('../boot/createSample')
// Sync db
sequelize.sync({force: false}).then(async()=>{
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
  OrderDetail
};
