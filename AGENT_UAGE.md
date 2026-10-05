# Agent Usage

This document explains how AI coding agents were used during the development of the Expense Claim Policy Review Assistant.

## Tools Used

- ChatGPT/Codex for planning, implementation guidance, debugging, and final review.
- Ollama for local AI review testing.
- MongoDB Compass for database inspection.
- Browser/manual testing for frontend workflow verification.
- npm scripts for frontend build, backend start, and seed verification.

## Representative Prompts

### Initial Build Prompt

Asked Codex to build a MERN stack internal application for reviewing employee expense claims against organizational policies, including deterministic validation, AI-assisted review, reviewer decisions, audit history, and policy management.

### Plain CSS Requirement

Asked Codex to use plain CSS only and avoid Tailwind CSS, Bootstrap, or UI component libraries.

### Ollama Integration Prompt

Asked Codex to add support for local open-source AI using Ollama with `AI_PROVIDER=ollama`, while preserving OpenAI-compatible and mock fallback support.

### Role Separation Prompt

Asked Codex to split the app into claimant and reviewer dashboards so claimants cannot see reviewer-only controls, AI internals, audit logs, or decision history.

### Clarification Flow Prompt

Asked Codex to add claimant clarification responses and optional proof links so reviewers can request additional information and claimants can respond.

### Final Requirement Pass Prompt

Asked Codex to review the implementation against the full problem statement and fix missing requirements such as totals calculation, active-policy retrieval, proof links, and route protection.

## Delegated Work

The agent helped with:

- Designing the MERN folder structure
- Creating backend models, routes, controllers, and services
- Creating deterministic validation logic
- Creating AI review provider logic for mock, Ollama, and OpenAI-compatible APIs
- Creating claimant and reviewer frontend flows
- Creating clarification and audit-log workflows
- Improving README and documentation
- Creating manual test data and demo flows

## Important Agent Mistakes Or Rejected Suggestions

- The first flow redirected claimants to a reviewer-style claim detail page. This was rejected because claimants should not see reviewer controls.
- The first mock-user flow used a fixed claimant name. This was rejected because the demo needs flexible role/name selection.
- The app initially supported clarification request from reviewer, but the claimant response was not visible to the reviewer. This was fixed by saving clarification fields on the claim and displaying them on reviewer detail.
- Deployment was considered, but since the assessment only asked for a GitHub link, deployment was not required.
- Real API keys were not committed. The app uses `.env.example` and supports mock AI fallback.

## Verification Performed

Manual verification included:

- Frontend build using `npm run build`
- Backend startup/import check
- MongoDB seed script
- Health endpoint check
- Claimant role selection
- Reviewer role selection
- Claim submission
- Deterministic validation for missing receipts, future dates, duplicates, unsupported currency, and category limits
- AI review through Ollama/mock fallback
- Reviewer approve, reject, request clarification, and override flows
- Claimant clarification response with proof link
- Reviewer visibility of clarification response
- Audit log updates
- Decision history updates
- Totals by claimant and category
- Claimant route protection
- Switch user flow

## Notes

The AI assisted in implementation and review, but final behavior was manually checked against the assessment requirements.