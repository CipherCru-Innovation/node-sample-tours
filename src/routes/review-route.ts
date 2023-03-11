/** @format */

import express from 'express';
import * as reviewHandler from '../controllers/review-handler';

const router = express.Router();

router.get('/', reviewHandler.getAllReviews);

export default router;
