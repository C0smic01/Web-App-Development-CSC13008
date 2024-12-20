const dotenv = require("dotenv");

dotenv.config({path:'../../config.env'})

const momoConfig = {
    vnp_TmnCode: process.env.vnp_TmnCode,
    vnp_HashSecret: process.env.vnp_HashSecret,
    vnp_Url: process.env.vnp_Url,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    
}

module.exports = {momoConfig}