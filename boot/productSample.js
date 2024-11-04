const Product = require('../models/Product')
const createProductSample = async ()=>{
    if (await Product.count() == 0)
    {
        await Product.create({
            product_name: 'Cotton Hoodie',
            price: '180000',
            remaining: 200,
            img : 'https://rapanuiclothing.com/cdn/shop/files/organic-cotton-hoodie-345382.png?v=1719838300',
            status_id
          })
    }
} 
module.exports = createProductSample 