"use strict";
class MongoQueryBuilder {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'size'];
        excludedFields.forEach((field) => delete queryObj[field]);
        //
        let queryStr = JSON.stringify(queryObj);
        // gte, gt, lte, lt, like
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }
    sortData() {
        if (this.queryString.sort) {
            this.query = this.query.sort(this.getSortFields());
        }
        return this;
    }
    getSortFields() {
        if (this.queryString.sort instanceof Array) {
            const sortFields = [];
            this.queryString.sort.forEach((ele) => {
                const [sfield, sorder] = ele.split(',');
                if (sorder && sorder.toUpperCase() === 'DESC') {
                    sortFields.push(`-${sfield}`);
                }
                else
                    sortFields.push(`${sfield}`);
            });
            return sortFields.join(' ');
        }
        const [sfield, sorder] = this.queryString.sort.split(',');
        if (sorder && sorder.toUpperCase() === 'DESC') {
            return `-${sfield}`;
        }
        return sfield;
    }
    paginate() {
        this.page = this.queryString.page * 1 || 1;
        this.size = this.queryString.size * 1 || 20;
        const skipRecords = (this.page - 1) * this.size;
        this.query = this.query.skip(skipRecords).limit(this.size);
        return this;
    }
    fields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }
        else {
            this.query = this.query.select('-__v');
        }
        return this;
    }
    build(paginate) {
        this.filter().fields().sortData();
        if (paginate === true)
            this.paginate();
        return this;
    }
    async getPageData() {
        const totalRecords = await this.query.model.countDocuments();
        // Include last and first elements
        const last = totalRecords <= this.page * this.size || undefined;
        const totalPage = Math.ceil(totalRecords / this.size);
        const currentPage = this.page * 1 || 1;
        const first = currentPage === 1;
        return {
            first,
            last,
            totalPage,
            totalRecords,
            currentPage
        };
    }
}
module.exports = MongoQueryBuilder;
