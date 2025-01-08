module.exports = (
    class IPayment {
        constructor(order) {
            this._order = order;
        }


        async createPaymentUrl() {
            throw new Error("Method 'createPaymentUrl()' must be implemented");
        }
    }
)