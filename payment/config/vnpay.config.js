const dotenv = require("dotenv");

dotenv.config({path:'../../config.env'})

const VNPAYConfig  = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: process.env.vnp_TmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    // vnp_TxnRef
    // vnp_OrderInfo 
    // vnp_OrderType
    // vnp_Amount
    // vnp_ReturnUrl
    // vnp_IpAddrr
    // vnp_CreateDate
    // vnp_BankCode

    vnp_HashSecret: process.env.vnp_HashSecret,
    vnp_Url: process.env.vnp_Url
    
}
module.exports = {VNPAYConfig }