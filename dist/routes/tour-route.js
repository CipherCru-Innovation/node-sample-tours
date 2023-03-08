"use strict";
/** @format */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tourHandler = __importStar(require("../controllers/tours-handler"));
const auth = __importStar(require("../auth/auth-handler"));
const review_route_1 = __importDefault(require("./review-route"));
const router = express_1.default.Router();
// TODO: Add Authentication middleware
router
    .route('/')
    .get(tourHandler.getAllTour)
    .post(auth.isAuthenticated, auth.restrictTo('admin'), tourHandler.createNewTour);
router.use(':id/reviews', review_route_1.default);
router
    .route('/:id')
    .get(tourHandler.getTourById)
    .patch(auth.isAuthenticated, auth.restrictTo('admin', 'lead-guide'), tourHandler.uploadTourImages, tourHandler.resizeTourImages, tourHandler.updateTour)
    .delete(auth.isAuthenticated, auth.restrictTo('admin', 'lead-guide'), tourHandler.deleteTour);
exports.default = router;
