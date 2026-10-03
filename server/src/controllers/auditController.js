import AuditLog from '../models/AuditLog.js';

export async function getClaimAudit(req, res, next) {
  try {
    const audit = await AuditLog.find({ claim: req.params.id }).sort({ createdAt: -1 });
    res.json(audit);
  } catch (error) {
    next(error);
  }
}
