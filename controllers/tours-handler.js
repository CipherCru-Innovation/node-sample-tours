const Tour = require('../models/tours/tour-model');
// const catchAsync = require('../utils/catchAsync');
const dataFactory = require('../factory/dataHandlerFactory');

exports.getAllTour = dataFactory.getPaginated(Tour);
exports.getTourById = dataFactory.getById(Tour, { path: 'reviews' });
exports.createNewTour = dataFactory.save(Tour);
exports.updateTour = dataFactory.updateOne(Tour);
exports.deleteTour = dataFactory.deleteOne(Tour);
