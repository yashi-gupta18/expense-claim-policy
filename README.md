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

The system should:

- Classify ambiguous claim descriptions into policy categories
- Retrieve the relevant policy section
- Explain why a claim may comply, require clarification, or need review
- Ask for missing information when necessary
- Cite policy evidence behind each finding
- Clearly mark uncertain classifications
- Detect duplicate claims
- Calculate totals
- Identify missing receipts
- Check configured category limits
- Validate dates and required fields
- Allow reviewers to approve, reject, request clarification, override AI classification, and view complete history

Not included because they are outside the scope:

- Actual reimbursement
- Payroll integration
- Tax advice
- Receipt OCR
- Payment processing


## Features

## Claimant Features

- Choose claimant role with any name
- Submit a new expense claim
- View only personal claims
- Track claim status
- See reviewer clarification requests
- Submit clarification response
- Add optional proof link

## Reviewer Features

- Choose reviewer role with any name
- View all submitted claims
- Review deterministic validation issues
- Review AI classification, confidence, reasoning, and recommendation
- View policy evidence and missing information
- Approve claims with reason
- Reject claims with reason
- Request clarification with reason
- Override AI classification with reason
- Refresh AI review
- View decision history
- View audit log



## Tech Stack

## Frontend

- React.js
- Vite
- React Router
- Axios
- Plain CSS

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- dotenv
- cors

## AI Support

- Mock AI fallback
- Ollama local AI support
- OpenAI-compatible API support


## Project Structure

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
