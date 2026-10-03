import AuditLog from '../models/AuditLog.js';

export async function createAuditLog({ claim, actor = 'system', action, message, metadata = {} }) {
  return AuditLog.create({ claim, actor, action, message, metadata });
}
