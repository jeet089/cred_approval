import CreditAssessment from './components/CreditAssessment';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Credit Approval Application</h1>
        <CreditAssessment />
      </div>
    </div>
  );
}

export default App;