const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt')
const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('../authentication/models/User')(sequelize, Sequelize.DataTypes);
const Role = require('../authentication/models/Role')(sequelize, Sequelize.DataTypes);
const Manufacturer = require('../shop/models/Manufacturer')(sequelize, Sequelize.DataTypes);
const Status = require('../shop/models/Status')(sequelize, Sequelize.DataTypes);
const Product = require('../shop/models/Product')(sequelize, Sequelize.DataTypes);
const Category = require('../shop/models/Category')(sequelize, Sequelize.DataTypes);
const UserRole = require('../authentication/models/UserRole')(sequelize, Sequelize.DataTypes);


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
        // const hashedPwd = await bcrypt.hash(user.password,saltRounds)
        const createdUser = await User.create({
          user_name: user.user_name,
          email: user.email,
          password: user.password,
          phone: user.phone,
        });
        
        const role = await Role.findOne({ where: { role_name: 'USER' } });
        if (role) {
          await UserRole.create({
            user_id: createdUser.user_id,
            role_id: role.role_id,
          });
        } 
      }
      

      console.log("Sample users created!");
    } 
    if(!await User.findOne({where: {user_name: 'admin'}}))
      {
        const saltRounds = 10 
        const adminUser = await User.create({
          user_name: 'admin',
          email: 'admin@example.com',
          password: "Admin1!",
          phone: '0123456789',
          is_verified: true,
        })
        const allRoles = await Role.findAll()
        if (allRoles && allRoles.length > 0) {
          for (const role of allRoles) {
            await UserRole.create({
              user_id: adminUser.user_id, 
              role_id: role.role_id,
            });
          }
        }
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
