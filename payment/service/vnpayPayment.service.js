const crypto = require('crypto');
const querystring = require('querystring');
const IPayment = require('./IPayment');
const VNPAYConfig = require('../config/vnpay.config')

class VNPayPayment extends IPayment {
    constructor(order) {
        super(order);
    }

    async createPaymentUrl() {
        const vnp_HashSecret = VNPAYConfig.vnp_HashSecret;
        const vnp_Url = VNPAYConfig.vnp_Url;

        const { orderId, amount, orderInfo, returnUrl, ipAddr } = this._order;

        const inputData = {
            vnp_Version: VNPAYConfig.vnp_Version,
            vnp_Command: VNPAYConfig.vnp_Command,
            vnp_TmnCode: VNPAYConfig.vnp_TmnCode,
            vnp_Amount: amount * 100,
            vnp_CurrCode: VNPAYConfig.vnp_CurrCode,
            vnp_TxnRef: orderId,
            vnp_OrderInfo: orderInfo,
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: new Date().toISOString().replace(/[-:.TZ]/g, '')
        };

        const sortedParams = Object.keys(inputData).sort().reduce((acc, key) => {
            acc[key] = inputData[key];
            return acc;
        }, {});

        const queryString = querystring.stringify(sortedParams);
        const hmac = crypto.createHmac('sha512', vnp_HashSecret);
        const secureHash = hmac.update(Buffer.from(queryString, 'utf-8')).digest('hex');

        return `${vnp_Url}?${queryString}&vnp_SecureHash=${secureHash}`;
    }
}

module.exports = VNPayPayment;
