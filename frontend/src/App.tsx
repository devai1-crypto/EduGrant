import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ClipboardList, GraduationCap, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

const LandingPage = () => (
  <div className="min-h-screen bg-riselogic-offwhite font-sans text-gray-900">
    {/* Navigation */}
    <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-riselogic-blue rounded-lg flex items-center justify-center">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-riselogic-blue">EduGrant AI</span>
      </div>
      <div className="flex items-center gap-8">
        <Link to="/apply" className="text-sm font-medium hover:text-riselogic-blue transition-colors">Apply Now</Link>
        <Link to="/status" className="text-sm font-medium hover:text-riselogic-blue transition-colors">Check Status</Link>
        <button className="bg-riselogic-blue text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all">
          Get Started
        </button>
      </div>
    </nav>

    {/* Hero Section */}
    <main className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full mb-6">
          <Zap className="w-4 h-4 text-riselogic-blue fill-current" />
          <span className="text-xs font-bold uppercase tracking-wider text-riselogic-blue">Agentic AI Powered</span>
        </div>
        <h1 className="text-6xl font-extrabold leading-tight mb-6">
          The future of <span className="text-riselogic-blue">Scholarship</span> automation.
        </h1>
        <p className="text-lg text-gray-600 mb-10 max-w-lg leading-relaxed">
          EduGrant AI uses multi-agent systems to automate financial aid processing. 
          Get decisions in minutes, not months.
        </p>
        <div className="flex items-center gap-4">
          <Link to="/apply" className="bg-riselogic-blue text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:shadow-xl hover:shadow-blue-500/40 transition-all group">
            Start Your Application
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden" />
            ))}
            <div className="pl-6 text-sm font-medium text-gray-500">
              Joined by <span className="text-gray-900 font-bold">500+ students</span> this week
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -inset-4 bg-riselogic-blue/10 rounded-[2.5rem] blur-2xl" />
        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/20">
          <img 
            src="/hero.png" 
            alt="University Campus" 
            className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-700" 
          />
          <div className="absolute bottom-6 left-6 right-6 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/50">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Live Agent Activity</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">Application #2942</p>
                <p className="text-xs text-gray-500">Processing Document Intelligence...</p>
              </div>
              <CheckCircle2 className="text-green-500 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </main>

    {/* How it works section (Simplified for User Focus) */}
    <section className="bg-white py-24 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-8 text-center">
        <h2 className="text-3xl font-bold mb-16">Seamless end-to-end processing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
          <div className="p-8 rounded-3xl bg-riselogic-offwhite border border-transparent hover:border-riselogic-blue/20 transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <ClipboardList className="text-riselogic-blue w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-4">Smart Submission</h3>
            <p className="text-gray-600 leading-relaxed">Upload your transcripts and IDs. Our AI identifies and extracts data automatically.</p>
          </div>
          <div className="p-8 rounded-3xl bg-riselogic-offwhite border border-transparent hover:border-riselogic-blue/20 transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="text-riselogic-blue w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-4">Fair Evaluation</h3>
            <p className="text-gray-600 leading-relaxed">Multi-agent reasoning ensures consistent scoring based on merit and financial need.</p>
          </div>
          <div className="p-8 rounded-3xl bg-riselogic-offwhite border border-transparent hover:border-riselogic-blue/20 transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="text-riselogic-blue w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-4">Instant Results</h3>
            <p className="text-gray-600 leading-relaxed">Receive automated notifications and clear feedback within minutes of submission.</p>
          </div>
        </div>
      </div>
    </section>

    {/* Footer with hidden admin access */}
    <footer className="px-8 py-12 max-w-7xl mx-auto border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
      <p className="text-sm text-gray-500">© 2024 EduGrant AI. Part of the Riselogic.ai suite.</p>
      <div className="flex gap-8">
        <Link to="/apply" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</Link>
        <Link to="/apply" className="text-sm text-gray-500 hover:text-gray-900">Terms of Service</Link>
        {/* Hidden Admin Entry Point (Very subtle) */}
        <Link to="/admin" className="text-[10px] text-gray-200 hover:text-gray-400">Admin</Link>
      </div>
    </footer>
  </div>
);

const StudentPortal = () => <div className="p-8 flex flex-col items-center justify-center min-h-screen">
  <h1 className="text-4xl font-bold mb-4">Student Application</h1>
  <p className="text-gray-600 mb-8 text-center max-w-md">The scholarship application form is currently being optimized for AI processing. Check back in a few minutes!</p>
  <Link to="/" className="text-riselogic-blue font-bold flex items-center gap-2">
    <ArrowRight className="w-5 h-5 rotate-180" /> Back to Home
  </Link>
</div>;

const AdminDashboard = () => <div className="p-8"><h1>Admin Dashboard</h1><p>Restricted Access</p></div>;
const TraceUI = () => <div className="p-8"><h1>Agent Trace UI</h1><p>System Telemetry Only</p></div>;

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
