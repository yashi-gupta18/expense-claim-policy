# Expense Claim Policy Review Assistant

A MERN stack internal application for reviewing employee expense claims against organizational expense policies.

The app supports two user flows:

- **Claimant:** submits claims, tracks status, and responds to clarification requests.
- **Reviewer:** reviews claims using deterministic validation, AI-assisted policy reasoning, policy evidence, decision history, and audit logs.

This project was built for the **Expense Claim Policy Review Assistant** assessment problem.



## Problem Statement

Build an internal application that reviews employee expense claims against a provided organizational expense policy.

Each claim contains:

- Claimant
- Date
- Category
- Amount
- Currency
- Description
- Receipt available: yes/no

The system supports:

- Classifying ambiguous claim descriptions into policy categories
- Retrieving the relevant policy section
- Explaining why a claim may comply, require clarification, or need review
- Asking for missing information when necessary
- Citing policy evidence behind each finding
- Clearly marking uncertain classifications
- Detecting duplicate claims
- Calculating totals
- Identifying missing receipts
- Checking configured category limits
- Validating dates and required fields
- Allowing reviewers to approve, reject, request clarification, override AI classification, and view complete history


## Completed Scope

- Claimant and reviewer role selection
- Claimant dashboard
- Reviewer dashboard
- Claim submission
- Claim status tracking
- Deterministic validation
- AI-assisted review
- Active policy retrieval
- Policy evidence display
- Missing information display
- Reviewer approval and rejection
- Reviewer clarification requests
- Claimant clarification responses
- Optional proof links for clarification
- AI classification override with reason
- Decision history
- Audit logs
- Policy management
- Total claim amount calculation
- Totals by claimant
- Totals by category
- Mock AI fallback
- Ollama local AI support
- OpenAI-compatible API support



## Excluded Scope

The following items are intentionally not included because they are outside the assessment scope:

- Actual reimbursement
- Payroll integration
- Tax advice
- Receipt OCR
- Payment processing
- Full production authentication
- Real file upload storage

The app uses mock role/name selection instead of full authentication, and proof is handled through an optional proof link.



## Features

### Claimant Features

- Choose claimant role with any name
- Submit a new expense claim
- View only personal claims
- Track claim status
- See reviewer clarification requests
- Submit clarification response
- Add optional proof link
- Protected claimant routes so one claimant cannot view another claimant’s claim

### Reviewer Features

- Choose reviewer role with any name
- View all submitted claims
- Review deterministic validation issues
- Review AI classification, confidence, reasoning, and recommendation
- View policy evidence and missing information
- View claimant clarification responses and proof links
- Approve claims with reason
- Reject claims with reason
- Request clarification with reason
- Override AI classification with reason
- Refresh AI review
- View decision history
- View audit log
- View total claim amount, totals by claimant, and totals by category



## Tech Stack

### Frontend

- React.js
- Vite
- React Router
- Axios
- Plain CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- dotenv
- cors

### AI Support

- Mock AI fallback
- Ollama local AI support
- OpenAI-compatible API support



## Architecture

The application is split into a React frontend and an Express/MongoDB backend.

### Frontend

The React frontend handles:

- Mock role selection
- Claimant dashboard
- Reviewer dashboard
- Claim submission forms
- Claim detail pages
- Reviewer decision forms
- Policy management UI
- Clarification response UI

### Backend

The Express backend handles:

- Claim APIs
- Policy APIs
- Review APIs
- Audit APIs
- Deterministic validation
- Policy retrieval
- AI review orchestration
- Reviewer decision updates
- Claimant clarification updates

### Services

- **Deterministic Validation Service:** validates required fields, future dates, duplicate claims, missing receipts, invalid amounts, unsupported currency, and configured policy/category limits.
- **Policy Retrieval Service:** retrieves active policies relevant to the claim category, description, and AI classification.
- **AI Review Service:** supports mock, Ollama, and OpenAI-compatible providers.
- **Audit Service:** records reviewer decisions and claimant clarification submissions.



## Project Structure

```txt
.
├── client
│   └── src
│       ├── api
│       ├── components
│       ├── pages
│       ├── styles
│       └── utils
│
└── server
    └── src
        ├── config
        ├── controllers
        ├── models
        ├── routes
        ├── seed
        ├── services
        └── validators