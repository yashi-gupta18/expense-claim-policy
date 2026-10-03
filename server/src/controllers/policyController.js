import Policy from '../models/Policy.js';
import { policySchema, policyUpdateSchema } from '../validators/policyValidator.js';

export async function createPolicy(req, res, next) {
  try {
    const policy = await Policy.create(policySchema.parse(req.body));
    res.status(201).json(policy);
  } catch (error) {
    next(error);
  }
}

export async function getPolicies(req, res, next) {
  try {
    const policies = await Policy.find().sort({ isActive: -1, category: 1, effectiveFrom: -1 });
    res.json(policies);
  } catch (error) {
    next(error);
  }
}

export async function getPolicy(req, res, next) {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) return res.status(404).json({ message: 'Policy not found' });
    res.json(policy);
  } catch (error) {
    next(error);
  }
}

export async function updatePolicy(req, res, next) {
  try {
    const policy = await Policy.findByIdAndUpdate(req.params.id, policyUpdateSchema.parse(req.body), { new: true, runValidators: true });
    if (!policy) return res.status(404).json({ message: 'Policy not found' });
    res.json(policy);
  } catch (error) {
    next(error);
  }
}

export async function deletePolicy(req, res, next) {
  try {
    const policy = await Policy.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!policy) return res.status(404).json({ message: 'Policy not found' });
    res.json(policy);
  } catch (error) {
    next(error);
  }
}
