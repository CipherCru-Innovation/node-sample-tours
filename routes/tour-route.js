const express = require('express');
const tourHandler = require('../controllers/tours-handler');

const router = express.Router();

// TODO: Add Authentication middleware
router.route('/').get(tourHandler.getAllTour).post(tourHandler.createNewTour);
router.route('/:id').get(tourHandler.getTourById).patch(tourHandler.updateTour).delete(tourHandler.deleteTour);

module.exports = router;
