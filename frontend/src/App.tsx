import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, ClipboardList, ShieldCheck, Activity } from 'lucide-react';

// Placeholder components
const LandingPage = () => (
  <div className="min-h-screen bg-riselogic-offwhite flex flex-col items-center justify-center p-8">
    <h1 className="text-5xl font-bold text-riselogic-blue mb-4">EduGrant AI</h1>
    <p className="text-xl text-gray-600 mb-8 max-w-2xl text-center">
      Automating the financial aid and scholarship application pipeline end-to-end with agentic AI.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
      <Link to="/apply" className="p-6 bg-white rounded-xl shadow-sm border hover:border-riselogic-blue transition-all group">
        <ClipboardList className="w-10 h-10 text-riselogic-blue mb-4 group-hover:scale-110 transition-transform" />
        <h2 className="text-xl font-semibold mb-2">Student Portal</h2>
        <p className="text-sm text-gray-500">Submit your application and track status in real-time.</p>
      </Link>
      <Link to="/admin" className="p-6 bg-white rounded-xl shadow-sm border hover:border-riselogic-blue transition-all group">
        <ShieldCheck className="w-10 h-10 text-riselogic-blue mb-4 group-hover:scale-110 transition-transform" />
        <h2 className="text-xl font-semibold mb-2">Admin Dashboard</h2>
        <p className="text-sm text-gray-500">Review applications and manage decision queues.</p>
      </Link>
      <Link to="/trace/demo" className="p-6 bg-white rounded-xl shadow-sm border hover:border-riselogic-blue transition-all group">
        <Activity className="w-10 h-10 text-riselogic-blue mb-4 group-hover:scale-110 transition-transform" />
        <h2 className="text-xl font-semibold mb-2">Agent Trace UI</h2>
        <p className="text-sm text-gray-500">Visualize the multi-agent reasoning process live.</p>
      </Link>
    </div>
  </div>
);

const StudentPortal = () => <div className="p-8"><h1>Student Portal</h1><p>Application Form Coming Soon</p></div>;
const AdminDashboard = () => <div className="p-8"><h1>Admin Dashboard</h1><p>Application Queue Coming Soon</p></div>;
const TraceUI = () => <div className="p-8"><h1>Agent Trace UI</h1><p>LangGraph Visualization Coming Soon</p></div>;

function App() {
  return (
    <Router>
      <div className="w-full">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/apply" element={<StudentPortal />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/trace/:runId" element={<TraceUI />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
