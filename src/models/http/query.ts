/** @format */

type QueryParams = {
    sort?: string | string[];
    page?: number;
    size?: number;
    fields?: string[];
};

export interface TourQueryParams extends QueryParams {
    fields: ['name' | 'id'];
}
export default QueryParams;
