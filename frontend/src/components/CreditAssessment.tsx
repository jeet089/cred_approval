import React, { useState } from 'react';
import axios from 'axios';

interface RiskAssessment {
  has_job: boolean;
  consistent_job: boolean;
  owns_home: boolean;
  owns_car: boolean;
  additional_income: boolean;
  points?: number;
}

interface FinancialInfo {
  monthly_income: string;
  monthly_expenses: string;
}

interface CreditResult {
  credit_amount: number;
  net_monthly_income: number;
}

type Step = 'risk_assessment' | 'financial_info' | 'email_confirmation' | 'rejected';

const CreditAssessment: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('risk_assessment');
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment>({
    has_job: false,
    consistent_job: false,
    owns_home: false,
    owns_car: false,
    additional_income: false,
  });
  const [financialInfo, setFinancialInfo] = useState<FinancialInfo>({
    monthly_income: '',
    monthly_expenses: '',
  });
  const [creditResult, setCreditResult] = useState<CreditResult | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRiskAssessmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/assess-risk', riskAssessment);
      const { points, approved, message } = response.data;
      
      setRiskAssessment(prev => ({ ...prev, points }));
      setMessage(message);
      
      if (approved) {
        setCurrentStep('financial_info');
      } else {
        setCurrentStep('rejected');
      }
    } catch (err) {
      setError('Failed to process risk assessment. Please try again.');
    }
    setLoading(false);
  };

  const handleFinancialInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate inputs
    const income = parseInt(financialInfo.monthly_income);
    const expenses = parseInt(financialInfo.monthly_expenses);
    
    if (income < 0 || expenses < 0) {
      setError('Income and expenses must be non-negative numbers');
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.post('/api/calculate-credit', {
        monthly_income: income,
        monthly_expenses: expenses
      });
      
      setCreditResult(response.data);
      setMessage(response.data.message);
      setCurrentStep('email_confirmation');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to calculate credit. Please try again.');
    }
    setLoading(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await axios.post('/api/send-approval', {
        email,
        risk_assessment: riskAssessment,
        financial_info: {
          monthly_income: parseInt(financialInfo.monthly_income),
          monthly_expenses: parseInt(financialInfo.monthly_expenses)
        },
        credit_amount: creditResult?.credit_amount
      });
      
      setMessage('PDF has been sent to your email address!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send email. Please try again.');
    }
    setLoading(false);
  };

  const goBack = () => {
    if (currentStep === 'financial_info') {
      setCurrentStep('risk_assessment');
    } else if (currentStep === 'email_confirmation') {
      setCurrentStep('financial_info');
    }
    setError('');
    setMessage('');
  };

  const renderRiskAssessmentStep = () => (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Risk Assessment</h2>
      <form onSubmit={handleRiskAssessmentSubmit} className="space-y-4">
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={riskAssessment.has_job}
              onChange={(e) => setRiskAssessment(prev => ({ ...prev, has_job: e.target.checked }))}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-gray-700">Do you have a paying job?</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={riskAssessment.consistent_job}
              onChange={(e) => setRiskAssessment(prev => ({ ...prev, consistent_job: e.target.checked }))}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-gray-700">Did you consistently have a paying job for past 12 months?</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={riskAssessment.owns_home}
              onChange={(e) => setRiskAssessment(prev => ({ ...prev, owns_home: e.target.checked }))}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-gray-700">Do you own a home?</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={riskAssessment.owns_car}
              onChange={(e) => setRiskAssessment(prev => ({ ...prev, owns_car: e.target.checked }))}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-gray-700">Do you own a car?</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={riskAssessment.additional_income}
              onChange={(e) => setRiskAssessment(prev => ({ ...prev, additional_income: e.target.checked }))}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-gray-700">Do you have any additional source of income?</span>
          </label>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Submit Assessment'}
        </button>
      </form>
    </div>
  );

  const renderFinancialInfoStep = () => (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Financial Information</h2>
      <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded">
        <p className="text-green-700 text-sm">Great! You scored {riskAssessment.points} points and qualify for credit.</p>
      </div>
      
      <form onSubmit={handleFinancialInfoSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Income (USD):
          </label>
          <input
            type="number"
            min="0"
            step="1"
            required
            value={financialInfo.monthly_income}
            onChange={(e) => setFinancialInfo(prev => ({ ...prev, monthly_income: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your total monthly income (whole dollars)"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Expenses (USD):
          </label>
          <input
            type="number"
            min="0"
            step="1"
            required
            value={financialInfo.monthly_expenses}
            onChange={(e) => setFinancialInfo(prev => ({ ...prev, monthly_expenses: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your total monthly expenses (whole dollars)"
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={goBack}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Calculating...' : 'Calculate Credit'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderEmailConfirmationStep = () => (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Credit Approved!</h2>
      
      <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded">
        <p className="text-green-700 font-semibold">{message}</p>
        <div className="mt-2 text-sm text-gray-600">
          <p>Net Monthly Income: ${creditResult?.net_monthly_income}</p>
          <p>Approved Credit Amount: ${creditResult?.credit_amount}</p>
        </div>
      </div>
      
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address:
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email address"
          />
          <p className="text-xs text-gray-500 mt-1">We'll send a PDF with your approval details to this email.</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={goBack}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send PDF'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderRejectedStep = () => (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Application Result</h2>
      
      <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded">
        <p className="text-red-700">{message}</p>
        <p className="text-sm text-gray-600 mt-2">You scored {riskAssessment.points} points (minimum required: 7)</p>
      </div>
      
      <button
        onClick={() => {
          setCurrentStep('risk_assessment');
          setRiskAssessment({
            has_job: false,
            consistent_job: false,
            owns_home: false,
            owns_car: false,
            additional_income: false,
          });
          setMessage('');
          setError('');
        }}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {error && (
        <div className="max-w-md mx-auto mb-4 p-4 bg-red-100 border border-red-400 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {message && currentStep === 'email_confirmation' && (
        <div className="max-w-md mx-auto mb-4 p-4 bg-green-100 border border-green-400 rounded">
          <p className="text-green-700">{message}</p>
        </div>
      )}
      
      {currentStep === 'risk_assessment' && renderRiskAssessmentStep()}
      {currentStep === 'financial_info' && renderFinancialInfoStep()}
      {currentStep === 'email_confirmation' && renderEmailConfirmationStep()}
      {currentStep === 'rejected' && renderRejectedStep()}
    </div>
  );
};

export default CreditAssessment;
