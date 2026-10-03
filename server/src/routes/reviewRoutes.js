import express from 'express';
import { getClaimReviews } from '../controllers/reviewController.js';

const router = express.Router({ mergeParams: true });

router.get('/claims/:id/reviews', getClaimReviews);

export default router;
