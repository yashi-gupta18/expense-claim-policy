const VALID_STATUSES = ['compliant', 'non_compliant', 'needs_clarification', 'uncertain'];
const VALID_ACTIONS = ['approve', 'reject', 'request_clarification', 'manual_review'];
const fallbackEvidence = 'AI review used deterministic and retrieved policy context because the configured AI provider was unavailable.';

function policyPayload(policies = []) {
  return policies.map((policy) => ({
    title: policy.title,
    category: policy.category,
    description: policy.description,
    maxAmount: policy.maxAmount,
    receiptRequired: policy.receiptRequired,
    allowedCurrencies: policy.allowedCurrencies,
    evidenceText: policy.evidenceText
  }));
}

function buildUserPrompt(claim, policies, deterministicIssues = []) {
  return `Analyze this expense claim against the relevant company policies. Return only valid JSON.

Required JSON schema:
{
  "classification": "string",
  "status": "compliant | non_compliant | needs_clarification | uncertain",
  "confidence": 0.85,
  "reasoning": "string",
  "policyEvidence": ["string"],
  "missingInformation": ["string"],
  "recommendedAction": "approve | reject | request_clarification | manual_review"
}

Allowed statuses: ${VALID_STATUSES.join(', ')}
Allowed recommended actions: ${VALID_ACTIONS.join(', ')}
The AI must recommend only. A human reviewer makes the final decision.

Claim:
${JSON.stringify(claim, null, 2)}

Deterministic validation issues:
${JSON.stringify(deterministicIssues, null, 2)}

Relevant policy sections:
${JSON.stringify(policyPayload(policies), null, 2)}`;
}

export function safeParseJson(text = '') {
  if (!text || typeof text !== 'string') return null;
  try {
    return JSON.parse(text);
  } catch {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1));
    } catch {
      return null;
    }
  }
}

function normalizeAiReview(data, { provider = 'mock', model = 'mock', isFallback = false } = {}) {
  const normalized = {
    classification: typeof data?.classification === 'string' && data.classification.trim() ? data.classification.trim() : 'Uncertain',
    status: VALID_STATUSES.includes(data?.status) ? data.status : 'uncertain',
    confidence: Math.max(0, Math.min(1, Number(data?.confidence) || 0.5)),
    reasoning: typeof data?.reasoning === 'string' && data.reasoning.trim() ? data.reasoning.trim() : 'The review could not determine a confident policy outcome.',
    policyEvidence: Array.isArray(data?.policyEvidence) ? data.policyEvidence.filter(Boolean).map(String) : [],
    missingInformation: Array.isArray(data?.missingInformation) ? data.missingInformation.filter(Boolean).map(String) : [],
    recommendedAction: VALID_ACTIONS.includes(data?.recommendedAction) ? data.recommendedAction : 'manual_review',
    provider: ['openai', 'ollama', 'mock'].includes(provider) ? provider : 'mock',
    model: model || provider || 'mock',
    isFallback: Boolean(isFallback),
    isMock: provider === 'mock' || Boolean(isFallback),
    reviewedAt: new Date()
  };

  if (!normalized.policyEvidence.length) {
    normalized.policyEvidence = [fallbackEvidence];
  }

  return normalized;
}

export function getMockAIReview(claim, policies = [], reason = 'Mock fallback used.', deterministicIssues = []) {
  const highIssue = deterministicIssues.find((issue) => issue.severity === 'high');
  const needsInfo = deterministicIssues.filter((issue) => ['missing_receipt', 'missing_required_field'].includes(issue.type));
  const description = `${claim.description || ''} ${claim.category || ''}`.toLowerCase();
  const matchedPolicy = policies[0];
  const classification = description.includes('dinner') || description.includes('snack') ? 'Meals' : matchedPolicy?.category || claim.category || 'Uncertain';

  let status = 'compliant';
  let recommendedAction = 'approve';
  if (needsInfo.length) {
    status = 'needs_clarification';
    recommendedAction = 'request_clarification';
  } else if (highIssue) {
    status = 'non_compliant';
    recommendedAction = 'reject';
  } else if (!matchedPolicy || classification === 'Uncertain') {
    status = 'uncertain';
    recommendedAction = 'manual_review';
  }

  return normalizeAiReview(
    {
      classification,
      status,
      confidence: highIssue ? 0.78 : 0.68,
      reasoning: `Fallback AI review classified this as ${classification}. ${highIssue ? highIssue.message : 'No high-severity deterministic issue was found.'} ${reason}`,
      policyEvidence: policies.length ? policies.map((policy) => policy.evidenceText) : [fallbackEvidence],
      missingInformation: needsInfo.map((issue) => issue.message),
      recommendedAction
    },
    { provider: 'mock', model: 'mock', isFallback: true }
  );
}

function normalizeOrFallback(data, context, fallbackReason) {
  const hasRequiredStrings = typeof data?.classification === 'string' && typeof data?.reasoning === 'string';
  const hasRequiredArrays = Array.isArray(data?.policyEvidence) && Array.isArray(data?.missingInformation);
  const hasValidEnums = VALID_STATUSES.includes(data?.status) && VALID_ACTIONS.includes(data?.recommendedAction);

  if (!hasRequiredStrings || !hasRequiredArrays || !hasValidEnums) {
    return getMockAIReview(context.claim, context.policies, fallbackReason, context.deterministicIssues);
  }

  return normalizeAiReview(data, context);
}

export async function reviewWithOpenAI(claim, policies = [], deterministicIssues = []) {
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  if (!process.env.OPENAI_API_KEY) {
    return getMockAIReview(claim, policies, 'OpenAI provider selected but OPENAI_API_KEY is missing.', deterministicIssues);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: 'You are an internal expense policy review assistant. Analyze an employee expense claim against company policy. Return only valid JSON. Do not include markdown, comments, or extra text.'
          },
          { role: 'user', content: buildUserPrompt(claim, policies, deterministicIssues) }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) throw new Error(`OpenAI API returned ${response.status}`);
    const json = await response.json();
    const parsed = safeParseJson(json.choices?.[0]?.message?.content || '');
    if (!parsed) return getMockAIReview(claim, policies, 'AI response was not valid JSON.', deterministicIssues);
    return normalizeOrFallback(parsed, { provider: 'openai', model, isFallback: false, claim, policies, deterministicIssues }, 'AI response was not valid JSON.');
  } catch (error) {
    return getMockAIReview(claim, policies, `OpenAI fallback: ${error.message}`, deterministicIssues);
  }
}

export async function reviewWithOllama(claim, policies = [], deterministicIssues = []) {
  const configuredBaseUrl = process.env.OLLAMA_BASE_URL || (process.env.OLLAMA_API_KEY ? 'https://ollama.com/api' : 'http://127.0.0.1:11434');
  const baseUrl = configuredBaseUrl.replace(/\/$/, '');
  const model = process.env.OLLAMA_MODEL || 'llama3.1';
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.OLLAMA_API_KEY) {
    headers.Authorization = `Bearer ${process.env.OLLAMA_API_KEY}`;
  }

  try {
    let chatUrl = `${baseUrl}/api/chat`;
    if (baseUrl.endsWith('/api')) chatUrl = `${baseUrl}/chat`;
    if (baseUrl.endsWith('/api/chat')) chatUrl = baseUrl;
    const response = await fetch(chatUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        stream: false,
        format: 'json',
        messages: [
          {
            role: 'system',
            content: 'You are an internal expense policy review assistant. Analyze an employee expense claim against company policy. Return only valid JSON. Do not include markdown, comments, or extra text.'
          },
          { role: 'user', content: buildUserPrompt(claim, policies, deterministicIssues) }
        ]
      })
    });

    if (!response.ok) throw new Error(`Ollama API returned ${response.status} for model "${model}"`);
    const json = await response.json();
    const parsed = safeParseJson(json.message?.content || '');
    if (!parsed) return getMockAIReview(claim, policies, 'AI response was not valid JSON.', deterministicIssues);
    return normalizeOrFallback(parsed, { provider: 'ollama', model, isFallback: false, claim, policies, deterministicIssues }, 'AI response was not valid JSON.');
  } catch (error) {
    return getMockAIReview(claim, policies, `Ollama fallback: ${error.message}. Confirm Ollama is running and the model is available.`, deterministicIssues);
  }
}

export async function reviewClaimWithAI(claim, policies = [], deterministicIssues = []) {
  const provider = (process.env.AI_PROVIDER || 'ollama').toLowerCase();
  if (provider === 'openai') return reviewWithOpenAI(claim, policies, deterministicIssues);
  if (provider === 'ollama') return reviewWithOllama(claim, policies, deterministicIssues);
  return getMockAIReview(claim, policies, `Unknown AI_PROVIDER "${provider}".`, deterministicIssues);
}

export const runAiReview = reviewClaimWithAI;
