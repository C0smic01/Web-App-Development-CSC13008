const { Op } = require('sequelize'); 
class QueryHelper {
    constructor(model, queryString) {
        this.model = model; 
        this.queryString = queryString; 
        this.queryOptions = {}; 
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ["page", "sort", "limit"];
        excludedFields.forEach(field => delete queryObj[field]);
    
        let whereCondition = {};
        Object.keys(queryObj).forEach(key => {

            if (typeof queryObj[key] === 'object' && !Array.isArray(queryObj[key])) {

                Object.keys(queryObj[key]).forEach(operator => {

                    if (Op[operator]) {  
                        const value = queryObj[key][operator];
                        if (!whereCondition[key]) {
                            whereCondition[key] = {};
                        }
    
                        whereCondition[key][Op[operator]] = isNaN(Number(value)) ? value : Number(value);
                    }
                });
            } else {
                whereCondition[key] = queryObj[key];
            }
        });
        this.queryOptions.where = whereCondition; 
        return this;
    }
    
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').map(field => field.trim());
            this.queryOptions.order = [[sortBy]]; 
        } else {
            this.queryOptions.order = [['created_at', 'DESC']]; 
        }
        return this;
    }   

    limit() {
        const limitVal = this.queryString.limit * 1 || 30;
        this.queryOptions.limit = limitVal; 
        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 30;
        const offset = (page - 1) * limit;

        this.queryOptions.offset = offset
        return this;
    }

    async executeQuery() {
        console.log(model)

        this.filter().sort().limit().paginate();
        return await this.model.findAll(this.queryOptions);
    }
}
module.exports = QueryHelper