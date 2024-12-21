const crypto = require('crypto');
const querystring = require('qs');
const IPayment = require('./IPayment.service.js');
const {VNPAYConfig } = require('../config/vnpay.config')
const moment = require('moment')
class VNPayPayment extends IPayment {
    constructor(order) {
        super(order);
    }

    async createPaymentUrl() {
        
        let date = new Date()
        let createDate = moment(date).format('YYYYMMDDHHmmss');

        const { orderId, amount, orderInfo, returnUrl, ipAddr,bankCode } = this._order;

        let vnp_Params = {}
        vnp_Params['vnp_Version'] = VNPAYConfig.vnp_Version;
        vnp_Params['vnp_Command'] = VNPAYConfig.vnp_Command;
        vnp_Params['vnp_TmnCode'] = VNPAYConfig.vnp_TmnCode;
        vnp_Params['vnp_Locale'] = VNPAYConfig.vnp_Locale;
        vnp_Params['vnp_CurrCode'] = VNPAYConfig.vnp_CurrCode;

        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = orderInfo;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        if(bankCode !== null && bankCode !== '' && bankCode !== 'undefined'){
            vnp_Params['vnp_BankCode'] = bankCode;
        }


        vnp_Params = sortObject(vnp_Params);

        let vnpUrl = VNPAYConfig.vnp_Url
        let secretKey = VNPAYConfig.vnp_HashSecret
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
    

        return vnpUrl
    }
}

function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}
module.exports = VNPayPayment;

