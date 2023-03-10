/** @format */

type QueryParams = {
    sort?: string | string[];
    page?: number;
    size?: number;
    fields?: string;
};

export interface TourQueryParams extends QueryParams {}
export default QueryParams;
