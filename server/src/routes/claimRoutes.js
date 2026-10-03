import express from 'express';
import { createClaim, decideClaim, getClaim, getClaims, reviewClaimWithAi } from '../controllers/claimController.js';

const router = express.Router();

router.post('/', createClaim);
router.get('/', getClaims);
router.get('/:id', getClaim);
router.post('/:id/review-ai', reviewClaimWithAi);
router.patch('/:id/decision', decideClaim);

export default router;
