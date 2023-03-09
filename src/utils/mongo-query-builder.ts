/** @format */ import { QueryWithHelpers } from 'mongoose';
import QueryParams from '../models/http/query';

class MongoQueryBuilder<T, Q extends QueryParams> {
    private queryString: Q;

    public query: QueryWithHelpers<T | T[] | null, T>;

    private excludedFields: string[] = ['page', 'sort', 'limit', 'fields', 'size'];

    private page = 1;

    private size = 20;

    constructor(query: QueryWithHelpers<T | T[] | null, T>, queryString: Q) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj: Q = { ...this.queryString };

        this.excludedFields.forEach((field: string) => {
            queryObj[field] = undefined;
        });

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

    getSortFields(): string | undefined {
        if (this.queryString.sort) {
            if (this.queryString.sort instanceof Array) {
                const sortFields: string[] = [];
                this.queryString.sort.forEach((ele: string) => {
                    const [sortField, sortOrder] = ele.split(',');

                    if (sortOrder && sortOrder.toUpperCase() === 'DESC') {
                        sortFields.push(`-${sortField}`);
                    } else {
                        sortFields.push(sortField);
                    }
                });
                return sortFields.join(' ');
            }

            const [sortField, sortOrder] = this.queryString.sort.split(',');
            if (sortOrder && sortOrder.toUpperCase() === 'DESC') {
                return `-${sortField}`;
            }
            return sortField;
        }
    }

    paginate() {
        this.page = this.queryString.page ? this.queryString.page : 1;
        this.size = this.queryString.size ? this.queryString.size : 1;

        const skipRecords = (this.page - 1) * this.size;

        this.query = this.query.skip(skipRecords).limit(this.size);
        return this;
    }

    fields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    build(paginate?: boolean) {
        this.filter().fields().sortData();
        if (paginate === true || this.queryString.page || this.queryString.size) this.paginate();
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

export default MongoQueryBuilder;
