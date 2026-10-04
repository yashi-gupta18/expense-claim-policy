import Claim from '../models/Claim.js';
import Review from '../models/Review.js';
import { claimCreateSchema, clarificationSchema, decisionSchema } from '../validators/claimValidator.js';
import { retrieveRelevantPolicies } from '../services/policyRetrievalService.js';
import { runDeterministicValidation } from '../services/deterministicValidationService.js';
import { runAiReview } from '../services/aiReviewService.js';
import { createAuditLog } from '../services/auditService.js';

function escapeRegex(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function createClaim(req, res, next) {
  try {
    const payload = claimCreateSchema.parse(req.body);
    const claimantName = payload.claimantName || payload.claimant;
    const policies = await retrieveRelevantPolicies(payload);
    const deterministicIssues = await runDeterministicValidation(payload, policies);
    const aiReview = await runAiReview(payload, policies, deterministicIssues);
    const claim = await Claim.create({
      ...payload,
      claimantName,
      deterministicIssues,
      aiReview,
      status: 'pending'
    });
    await createAuditLog({ claim: claim._id, action: 'claim_created', message: 'Claim submitted and sent for reviewer decision.' });
    res.status(201).json(claim);
  } catch (error) {
    next(error);
  }
}

export async function getClaims(req, res, next) {
  try {
    const { status, search, claimant, claimantId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (claimant) {
      const exactClaimant = new RegExp(`^${escapeRegex(claimant)}$`, 'i');
      query.$or = [
        { claimant: exactClaimant },
        { claimantName: exactClaimant }
      ];
    }
    if (claimantId) query.claimantId = claimantId;
    if (search) {
      const searchFilters = [
        { claimant: new RegExp(search, 'i') },
        { claimantName: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
      query.$and = query.$and || [];
      query.$and.push({ $or: searchFilters });
    }
    const claims = await Claim.find(query).sort({ createdAt: -1 });
    res.json(claims);
  } catch (error) {
    next(error);
  }
}

export async function getClaim(req, res, next) {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    res.json(claim);
  } catch (error) {
    next(error);
  }
}

export async function reviewClaimWithAi(req, res, next) {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    const policies = await retrieveRelevantPolicies(claim);
    const deterministicIssues = await runDeterministicValidation(claim.toObject(), policies, claim._id);
    const aiReview = await runAiReview(claim.toObject(), policies, deterministicIssues);
    claim.deterministicIssues = deterministicIssues;
    claim.aiReview = aiReview;
    await claim.save();
    await createAuditLog({ claim: claim._id, action: 'ai_review_completed', message: 'AI-assisted policy review was refreshed.' });
    res.json(claim);
  } catch (error) {
    next(error);
  }
}

export async function decideClaim(req, res, next) {
  try {
    const payload = decisionSchema.parse(req.body);
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    const previousStatus = claim.status;
    const statusMap = {
      approve: 'approved',
      reject: 'rejected',
      request_clarification: 'needs_clarification',
      override_ai: claim.status
    };
    const nextStatus = statusMap[payload.action];

    if (payload.action === 'override_ai' && payload.overrideClassification) {
      claim.aiReview = {
        ...(claim.aiReview?.toObject?.() || claim.aiReview || {}),
        classification: payload.overrideClassification,
        status: 'uncertain',
        recommendedAction: 'manual_review',
        reasoning: `${claim.aiReview?.reasoning || ''} Reviewer override: ${payload.reason}`.trim()
      };
      claim.status = 'uncertain';
    } else {
      claim.status = nextStatus;
      claim.finalDecision = nextStatus === 'approved' || nextStatus === 'rejected' ? nextStatus : null;
      claim.finalDecisionReason = payload.reason;
      if (payload.action === 'request_clarification') {
        claim.clarificationRequest = payload.reason;
      }
    }
    claim.reviewer = payload.reviewer;
    claim.reviewedBy = payload.reviewer;
    claim.reviewedAt = new Date();
    await claim.save();

    await Review.create({
      claim: claim._id,
      reviewer: payload.reviewer,
      action: payload.action,
      previousStatus,
      newStatus: claim.status,
      reason: payload.reason,
      overrideClassification: payload.overrideClassification
    });
    await createAuditLog({
      claim: claim._id,
      actor: payload.reviewer,
      action: `reviewer_${payload.action}`,
      message: `Reviewer action changed status from ${previousStatus} to ${claim.status}.`,
      metadata: { reason: payload.reason, overrideClassification: payload.overrideClassification }
    });

    res.json(claim);
  } catch (error) {
    next(error);
  }
}

export async function submitClarification(req, res, next) {
  try {
    const payload = clarificationSchema.parse(req.body);
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    const previousStatus = claim.status;
    claim.clarificationResponse = payload.clarificationResponse;
    claim.clarificationProofLink = payload.clarificationProofLink || '';
    claim.status = 'under_review';
    await claim.save();

    await createAuditLog({
      claim: claim._id,
      actor: payload.claimant || claim.claimantName || claim.claimant,
      action: 'clarification_submitted',
      message: `Claimant submitted clarification and status changed from ${previousStatus} to under_review.`,
      metadata: { proofLink: claim.clarificationProofLink }
    });

    res.json(claim);
  } catch (error) {
    next(error);
  }
}
