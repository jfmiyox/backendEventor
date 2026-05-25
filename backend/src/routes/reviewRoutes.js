import express from "express";

import {
    getReviews,
    createReview,
    authMiddleware
} from "../controllers/reviewController.js";

const router = express.Router();

router.get(
    "/:type/:id/reviews",
    getReviews
);

router.post(
    "/:type/:id/reviews",
    authMiddleware,
    createReview
);

export default router;