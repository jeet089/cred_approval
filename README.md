# CredApprove

A credit approval web application built with Elixir/Phoenix backend and React frontend. The application assesses users through a 5-question risk assessment, calculates credit eligibility, and sends approval details via email.

## Features

### Risk Assessment (5 Questions)
- Do they have a paying job (4 points)
- Did they consistently have a paying job for past 12 months (2 points)
- Do they own a home (2 points)
- Do they own a car (1 point)
- Do they have any additional source of income (2 points)

### Credit Calculation
- Users need more than 6 points to qualify
- Credit amount = (Monthly Income - Monthly Expenses) × 12
- Email with detailed approval information

### Rejection Handling
- Users with 6 or fewer points receive rejection message
- No further processing for rejected applications

## Architecture

### Backend (Phoenix API)
- **Phoenix 1.7+** with API-only configuration
- **Swoosh** for email sending

### Frontend (React SPA)
- **React 19** with TypeScript
- **Axios** for API communication

## Prerequisites
- **Elixir** (>= 1.14)
- **Node.js** (>= 18)
- **npm** or **yarn**

### PDF Generation Requirements
- **Chromium or Chrome** - Required for PDF generation via ChromicPDF
  - **macOS**: `brew install chromium` or `brew install --cask google-chrome`

## Setup Instructions

### 1. Install Backend Dependencies

```bash
# Install Elixir dependencies
mix setup
```

### 2. Install Frontend Dependencies

```bash
# Navigate to frontend directory and install dependencies
cd frontend
npm install
```

### 3. Start Development Servers

#### Option A: Start Both Servers Separately

**Terminal 1 - Backend (Phoenix):**
```bash
# From project root
mix phx.server
```
Backend runs on: http://localhost:4000

**Terminal 2 - Frontend (React):**
```bash
# From project root
cd frontend
npm run dev
```
Frontend runs on: http://localhost:3000

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api/*
- **Dev Tools**: http://localhost:4000/dev/dashboard (Phoenix LiveDashboard)`
  
### Accessing Development Emails
In development mode, sent emails can be viewed at:
Swoosh Mailbox: http://localhost:4000/dev/mailbox


### Manual Testing
1. Start both servers
2. Visit http://localhost:3000
3. Complete the risk assessment form
4. Test both approval and rejection scenarios
