# CredApprove

A credit approval web application built with Elixir/Phoenix backend and React frontend. The application assesses users through a 5-question risk assessment, calculates credit eligibility, and sends approval details via email.

## Architecture
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

**Terminal 1 - Backend:**
```bash
# From project root
mix phx.server
```
Backend runs on: http://localhost:4000

**Terminal 2 - Frontend:**
```bash
# From project root
cd frontend
npm run dev
```
Frontend runs on: http://localhost:3000

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api/*
  
### Accessing Development Emails
In development mode, sent emails can be viewed at:
Swoosh Mailbox: http://localhost:4000/dev/mailbox
