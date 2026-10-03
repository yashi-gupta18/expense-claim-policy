import express from 'express';
import { createPolicy, deletePolicy, getPolicies, getPolicy, updatePolicy } from '../controllers/policyController.js';

const router = express.Router();

router.post('/', createPolicy);
router.get('/', getPolicies);
router.get('/:id', getPolicy);
router.patch('/:id', updatePolicy);
router.delete('/:id', deletePolicy);

export default router;
