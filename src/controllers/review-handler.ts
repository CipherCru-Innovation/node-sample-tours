/** @format */

import Review from '../models/reviews/review';
import * as dataFactory from '../factory/data-handler-factory';

export const getAllReviews = dataFactory.getPaginated(Review);
