import express from 'express';
import { getClaimAudit } from '../controllers/auditController.js';

const router = express.Router({ mergeParams: true });

router.get('/claims/:id/audit', getClaimAudit);

export default router;
