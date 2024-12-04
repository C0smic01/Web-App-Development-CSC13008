const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt')
const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('../models/User')(sequelize, Sequelize.DataTypes);
const Role = require('../models/Role')(sequelize, Sequelize.DataTypes);
const Manufacturer = require('../models/Manufacturer')(sequelize, Sequelize.DataTypes);
const Status = require('../models/Status')(sequelize, Sequelize.DataTypes);
const Product = require('../models/Product')(sequelize, Sequelize.DataTypes);
const Category = require('../models/Category')(sequelize, Sequelize.DataTypes);


const createCategorySample = async () => {
  try {
    if (await Category.count() === 0) {

      const data = fs.readFileSync(path.join(__dirname, './json/categories.json'), 'utf-8');
      const categories = JSON.parse(data)
      for (const c of categories) {
        await Category.create({
          category_id: c.category_id,
          category_name: c.category_name
        });
      }

      console.log("Sample category created!");
    } 
  } catch (error) {
    console.error("Unable to create sample category:", error);
  }
};


const createManufacturerSample = async () => {
  try {
    if (await Manufacturer.count() === 0) {

      const data = fs.readFileSync(path.join(__dirname, './json/manufacturers.json'), 'utf-8');
      const manufacturers = JSON.parse(data)

      for (const m of manufacturers) {
        await Manufacturer.create({
          manufacturer_id: m.manufacturer_id,
          m_name: m.m_name
        });
      }

      console.log("Sample manufacturers created!");
    }
  } catch (error) {
    console.error("Unable to create sample manufacturers:", error);
  }
};


const createRoleSample = async () => {
  try {
    if (await Role.count() === 0) {

      const data = fs.readFileSync(path.join(__dirname, './json/roles.json'), 'utf-8');
      const roles = JSON.parse(data)

      for (const role of roles) {
        await Role.create({
          role_id: role.role_id ,
          role_name: role.role_name,
          description: role.description
        });
      }

      console.log("Sample roles created!");
    } 
  } catch (error) {
    console.error("Unable to create sample role:", error);
  }
};


const createStatusSample = async () => {
  try {
    if (await Status.count() === 0) {

      const data = fs.readFileSync(path.join(__dirname, './json/status.json'), 'utf-8');
      const status = JSON.parse(data)

      for (const s of status) {
        await Status.create({
          status_id: s.status_id,
          status_name: s.status_name,
          status_type : s.status_type
        });
      }

      console.log("Sample status created!");
    }
  } catch (error) {
    console.error("Unable to create sample status:", error);
  }
};


const createProductSample = async () => {
  try {
    if (await Product.count() === 0) {

      const data = fs.readFileSync(path.join(__dirname, './json/products.json'), 'utf-8');
      const products = JSON.parse(data)

      for (const product of products) {
        await Product.create({
          product_name: product.product_name,
          price: parseFloat(product.price)*1000,
          remaining: product.remaining,
          img: product.img,
          status_id: product.status_id,
          manufacturer_id : product.manufacturer_id,
          description: product.description
        });
      }

      console.log("Sample products created!");
    }
  } catch (error) {
    console.error("Unable to create sample products:", error);
  }
};


const createUserSample = async () => {
  try {
    if (await User.count() === 0) {

      const data = fs.readFileSync(path.join(__dirname, './json/users.json'), 'utf-8');
      const users = JSON.parse(data)
      const saltRounds = 10 

      for (const user of users) {
        const hashedPwd = await bcrypt.hash(user.password,saltRounds)
        await User.create({
          user_name: user.user_name,
          email: user.email,
          password: hashedPwd,
          phone: user.phone
        });
      }

      console.log("Sample users created!");
    } 
  } catch (error) {
    console.error("Unable to create sample users:", error);
  }
}


const createProductCategorySample = async () => {
  try {
    const existingAssociations = await sequelize.query(
      'SELECT COUNT(*) as count FROM product_category',
      { type: sequelize.QueryTypes.SELECT }
    );

    if (parseInt(existingAssociations[0].count) === 0) {
      const data = fs.readFileSync(path.join(__dirname, './json/product_category.json'), 'utf-8');
      const productCategories = JSON.parse(data);

      for (const pc of productCategories) {
        await sequelize.query(
          'INSERT INTO product_category (product_id, category_id) VALUES (?, ?)',
          { 
            replacements: [pc.product_id, pc.category_id],
            type: sequelize.QueryTypes.INSERT 
          }
        );
      }

      console.log("Sample product categories created!");
    }
  } catch (error) {
    console.error("Unable to create sample product_categories:", error);
  }
};


module.exports = {createCategorySample, createUserSample, createStatusSample, createRoleSample, createProductSample, createManufacturerSample, createProductCategorySample}
