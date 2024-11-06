class QueryHelper {
    constructor(model, queryString) {
        this.model = model; // Lưu mô hình
        this.queryString = queryString; 
        this.queryOptions = {}; // Khởi tạo options cho truy vấn
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ["page", "sort", "limit"];
        excludedFields.forEach(field => delete queryObj[field]);

        let whereCondition = {};
        Object.keys(queryObj).forEach(key => {
            if (queryObj[key].includes(',')) {
                whereCondition[key] = queryObj[key].split(',');
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

        this.filter().sort().limit().paginate();
        
        return await this.model.findAll(this.queryOptions);
    }
}
module.exports = QueryHelper