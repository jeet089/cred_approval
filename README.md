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
- **No Database** - Session-based processing
- **CORS enabled** for frontend communication
- **Swoosh** for email sending
- **JSON API** endpoints for credit assessment

### Frontend (React SPA)
- **React 19** with TypeScript
- **Vite** for development server and building
- **Tailwind CSS v4** for styling
- **Axios** for API communication
- **Multi-step form** with navigation

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

#### Option B: Development Commands

```bash
# Backend only
mix phx.server

# Frontend only (from project root)
cd frontend && npm run dev

# Frontend build
cd frontend && npm run build
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api/*
- **Dev Tools**: http://localhost:4000/dev/dashboard (Phoenix LiveDashboard)

## API Endpoints

### POST /api/assess-risk
Risk assessment with 5 questions

**Request:**
```json
{
  "has_job": true,
  "consistent_job": true,
  "owns_home": false,
  "owns_car": true,
  "additional_income": false
}
```

**Response (Approved):**
```json
{
  "points": 7,
  "approved": true,
  "message": "You qualify for the next step!"
}
```

**Response (Rejected):**
```json
{
  "points": 5,
  "approved": false,
  "message": "Thank you for your answer. We are currently unable to issue credit to you."
}
```

### POST /api/calculate-credit
Calculate credit amount for approved users

**Request:**
```json
{
  "monthly_income": 5000,
  "monthly_expenses": 2000
}
```

**Response:**
```json
{
  "credit_amount": 36000,
  "net_monthly_income": 3000,
  "message": "Congratulations, you have been approved for credit up to $36000 USD"
}
```

### POST /api/send-approval
Send approval details via email

**Request:**
```json
{
  "email": "user@example.com",
  "risk_assessment": {...},
  "financial_info": {...},
  "credit_amount": 36000
}
```

**Response:**
```json
{
  "message": "Email has been sent to your email address"
}
```

## Application Flow

1. **Risk Assessment**: User answers 5 yes/no questions
2. **Point Calculation**: System calculates total points (max 11)
3. **Qualification Check**: 
   - ≤ 6 points: Rejection message, process stops
   - > 6 points: Proceed to financial information
4. **Financial Input**: Monthly income and expenses
5. **Credit Calculation**: (Income - Expenses) × 12
6. **Email Collection**: User provides email address
7. **Approval Email**: HTML email with all details sent immediately

## Email Configuration

The application uses Phoenix's default Swoosh mailer configuration. For development, emails are logged to the console. For production, configure your preferred email adapter in `config/prod.exs`.

### Accessing Development Emails
In development mode, sent emails can be viewed at:
- **Swoosh Mailbox**: http://localhost:4000/dev/mailbox

## PDF Generation

The application uses **ChromicPDF** to generate PDF attachments for credit approval emails. 

### Prerequisites
- Chromium or Chrome browser must be installed
- Optional: Ghostscript for PDF/A support

### Configuration
PDF generation is automatically configured and will:
- Generate HTML-based email content
- Convert to PDF using ChromicPDF
- Attach PDF to approval emails
- Fallback gracefully if PDF generation fails

## Development Notes

- **No Database Required**: All processing is session-based
- **CORS Configured**: Frontend (port 3000) can communicate with backend (port 4000)
- **API Proxy**: Vite dev server proxies `/api/*` requests to Phoenix
- **Email Format**: HTML emails with styled approval details (PDF generation removed due to wkhtmltopdf deprecation)
- **Error Handling**: Comprehensive validation and error messages

## Testing

### Manual Testing
1. Start both servers
2. Visit http://localhost:3000
3. Complete the risk assessment form
4. Test both approval and rejection scenarios

### API Testing with curl

```bash
# Test risk assessment (approved)
curl -X POST http://localhost:4000/api/assess-risk \
  -H "Content-Type: application/json" \
  -d '{"has_job": true, "consistent_job": true, "owns_home": false, "owns_car": true, "additional_income": false}'

# Test credit calculation
curl -X POST http://localhost:4000/api/calculate-credit \
  -H "Content-Type: application/json" \
  -d '{"monthly_income": 5000, "monthly_expenses": 2000}'
```

## Deployment

For production deployment:
1. Build the frontend: `cd frontend && npm run build`
2. Configure email settings in `config/prod.exs`
3. Set environment variables for production
4. Deploy using standard Phoenix deployment practices

## Project Structure

```
├── lib/
│   ├── cred_approve/              # Core application logic
│   └── cred_approve_web/          # Web interface
│       ├── controllers/
│       │   └── credit_controller.ex
│       └── router.ex
├── frontend/                      # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── CreditAssessment.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── config/                        # Phoenix configuration
└── mix.exs                       # Elixir dependencies
```
