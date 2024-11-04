const Status = require('../models/Status')
const createStatusSample = async()=>{
    if (await Status.count() == 0)
    {
        await Status.create({
            status_name: 'OUT_OF_STOCK',
            status_type : 'PRODUCT'
          })
    }
}
module.exports = createStatusSample 
