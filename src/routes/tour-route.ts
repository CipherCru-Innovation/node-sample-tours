/** @format */

import express from 'express';
import * as tourHandler from '../controllers/tours-handler';
import * as auth from '../auth/auth-handler';
import reviewRouter from './review-route';

const router = express.Router();

// TODO: Add Authentication middleware
router
    .route('/')
    .get(tourHandler.getAllTour)
    .post(
        auth.isAuthenticated,
        auth.restrictTo('admin'),
        tourHandler.createNewTour
    );
router.use(':id/reviews', reviewRouter);
router
    .route('/:id')
    .get(tourHandler.getTourById)
    .patch(
        auth.isAuthenticated,
        auth.restrictTo('admin', 'lead-guide'),
        tourHandler.uploadTourImages,
        tourHandler.resizeTourImages,
        tourHandler.updateTour
    )
    .delete(
        auth.isAuthenticated,
        auth.restrictTo('admin', 'lead-guide'),
        tourHandler.deleteTour
    );

export default router;
