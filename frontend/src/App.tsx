import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Zap, ArrowRight, CheckCircle2, 
  Upload, FileText, User, Mail, Globe, Calendar,
  Loader2, X, AlertCircle, BookOpen, Banknote,
  Shield, Menu, ChevronRight, Star, Activity, ShieldCheck,
  ChevronLeft, Sparkles
} from 'lucide-react';

// --- Animated Layout Component ---
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

// --- Sophisticated Navigation ---
const Navbar = () => {
  const location = useLocation();
  const isApplyPage = location.pathname.startsWith('/apply');
  
  if (isApplyPage) return null; // Hide navbar on the focused apply page

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 bg-navy rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-navy">EduGrant <span className="text-electric">AI</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-10 text-sm font-bold text-gray-500 uppercase tracking-widest">
          {['Platform', 'Intelligence', 'Institutions'].map((item) => (
            <a key={item} href="#" className="hover:text-navy transition-colors">{item}</a>
          ))}
        </div>
        <Link to="/apply" className="px-6 py-3 rounded-full text-sm font-black bg-electric text-white shadow-xl shadow-electric/20 hover:scale-105 transition-all active:scale-95">
          Apply Now
        </Link>
      </div>
    </nav>
  );
};

// --- High-End Landing Page ---
const LandingPage = () => (
  <PageWrapper>
    <div className="pt-32 pb-24 hero-gradient min-h-screen">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 mb-8">
              <div className="w-2 h-2 rounded-full bg-electric animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Intelligent Admissions v1.0</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-serif text-7xl md:text-8xl leading-[1.05] text-navy mb-8">
              Excellence <br /> <span className="italic font-light text-electric">Automated.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-xl text-gray-500 max-w-xl leading-relaxed mb-12 font-medium">
              EduGrant AI is the world's first multi-agent platform for institutional scholarship evaluation. 
              We bridge the gap between human potential and educational funding.
            </motion.p>
            <Link to="/apply" className="inline-flex bg-navy text-white px-10 py-5 rounded-2xl font-black text-lg items-center gap-3 hover:shadow-2xl hover:bg-black transition-all group">
              Begin Application <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-[-40px_40px_80px_rgba(0,0,0,0.1)] border-[12px] border-white">
              <img src="/hero.png" alt="Excellence" className="w-full h-full object-cover scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
              <div className="absolute bottom-10 left-10 right-10">
                <div className="glass-card p-6 rounded-2xl text-navy">
                  <div className="flex items-center gap-4 mb-2">
                    <Star className="text-gold fill-current w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Merit Score: 98/100</span>
                  </div>
                  <p className="text-sm font-medium opacity-70">"The AI accurately identified my specific research achievements."</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageWrapper>
);

// --- Split-Screen Application Portal ---
const StudentPortal = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    transcript: null,
    id: null,
    essay: null,
    income: null
  });

  const handleFileChange = (type: string, file: File | null) => {
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/status/demo-run-123');
    }, 3000);
  };

  const steps = [
    { id: 1, title: 'Identity', desc: 'Who are you?' },
    { id: 2, title: 'Academic', desc: 'Your achievements' },
    { id: 3, title: 'Financial', desc: 'Need assessment' },
    { id: 4, title: 'Submission', desc: 'Final documents' }
  ];

  return (
    <div className="h-screen w-full flex bg-white overflow-hidden">
      
      {/* Left Panel: Cinematic Branding (Fixed) */}
      <div className="hidden lg:flex w-5/12 bg-navy relative overflow-hidden flex-col justify-between p-16">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-electric rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-royal rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        </div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group mb-20">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-xl flex items-center justify-center border border-white/20">
              <GraduationCap className="text-white w-7 h-7" />
            </div>
            <span className="text-3xl font-black tracking-tight text-white italic">EduGrant <span className="text-electric">AI</span></span>
          </Link>
          
          <div className="space-y-6">
            <div className="w-12 h-1 bg-electric rounded-full" />
            <h2 className="text-serif text-6xl text-white leading-tight">
              Start your <br />
              <span className="italic font-light">journey.</span>
            </h2>
            <p className="text-blue-100/50 text-xl max-w-sm leading-relaxed">
              Our agents are ready to analyze your potential. Experience the future of admissions.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="space-y-8">
            {steps.map((s) => (
              <div key={s.id} className={`flex items-center gap-6 transition-all duration-500 ${step === s.id ? 'translate-x-4 opacity-100' : 'opacity-30 scale-95'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 ${step === s.id ? 'bg-electric border-electric text-white' : 'border-white/20 text-white'}`}>
                  {s.id < step ? <CheckCircle2 className="w-5 h-5" /> : s.id}
                </div>
                <div>
                  <p className="text-white font-black text-sm uppercase tracking-widest">{s.title}</p>
                  <p className="text-blue-100/40 text-xs font-medium">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel: Focused Form (Scrollable) */}
      <div className="flex-1 h-screen overflow-y-auto bg-alabaster relative px-8 py-16 lg:px-24 lg:py-32">
        <div className="max-w-2xl mx-auto">
          
          <div className="mb-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-gray-400 font-bold hover:text-navy transition-colors text-sm uppercase tracking-widest">
              <ChevronLeft className="w-4 h-4" /> Exit
            </Link>
            <div className="lg:hidden flex gap-2">
               {steps.map(s => <div key={s.id} className={`w-2 h-2 rounded-full ${step === s.id ? 'bg-electric' : 'bg-gray-200'}`} />)}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              {step === 1 && (
                <div className="space-y-12">
                  <header>
                    <div className="inline-flex items-center gap-2 text-electric font-black text-[10px] uppercase tracking-[0.3em] mb-4">
                      <User className="w-3 h-3" /> Step 01 / 04
                    </div>
                    <h3 className="text-serif text-6xl text-navy mb-6 leading-tight">Your <span className="italic">Identity.</span></h3>
                    <p className="text-gray-400 text-lg font-medium">We start with the basics to establish your profile.</p>
                  </header>
                  
                  <div className="space-y-10">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block group-focus-within:text-electric transition-colors">Legal Full Name</label>
                      <input type="text" className="w-full bg-transparent border-b-2 border-gray-200 py-4 text-3xl font-bold focus:border-electric outline-none transition-all placeholder:text-gray-200" placeholder="Ex: John Doe" />
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block group-focus-within:text-electric transition-colors">Institutional Email</label>
                      <input type="email" className="w-full bg-transparent border-b-2 border-gray-200 py-4 text-3xl font-bold focus:border-electric outline-none transition-all placeholder:text-gray-200" placeholder="name@edu.com" />
                    </div>
                    <div className="grid grid-cols-2 gap-10">
                      <div className="group">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block group-focus-within:text-electric transition-colors">Nationality</label>
                        <select className="w-full bg-transparent border-b-2 border-gray-200 py-4 text-xl font-bold focus:border-electric outline-none appearance-none">
                          <option>United States</option>
                          <option>India</option>
                          <option>United Kingdom</option>
                        </select>
                      </div>
                      <div className="group">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block group-focus-within:text-electric transition-colors">Student ID</label>
                        <input type="text" className="w-full bg-transparent border-b-2 border-gray-200 py-4 text-xl font-bold focus:border-electric outline-none transition-all" placeholder="Optional" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-10">
                    <button onClick={() => setStep(2)} className="bg-navy text-white px-12 py-6 rounded-2xl font-black text-xl flex items-center gap-4 hover:bg-electric transition-all shadow-2xl hover:shadow-electric/20 group">
                      Proceed <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-12">
                  <header>
                    <div className="inline-flex items-center gap-2 text-electric font-black text-[10px] uppercase tracking-[0.3em] mb-4">
                      <BookOpen className="w-3 h-3" /> Step 02 / 04
                    </div>
                    <h3 className="text-serif text-6xl text-navy mb-6 leading-tight">Academic <span className="italic">Records.</span></h3>
                    <p className="text-gray-400 text-lg font-medium">Your merits are the core of the evaluation.</p>
                  </header>
                  
                  <div className="space-y-10">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Institution Name</label>
                      <input type="text" className="w-full bg-transparent border-b-2 border-gray-200 py-4 text-2xl font-bold focus:border-electric outline-none transition-all" placeholder="University of Example" />
                    </div>
                    <div className="grid grid-cols-2 gap-10">
                      <div className="group">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Cumulative GPA</label>
                        <input type="number" step="0.01" className="w-full bg-transparent border-b-2 border-gray-200 py-4 text-2xl font-bold focus:border-electric outline-none transition-all" placeholder="4.00" />
                      </div>
                      <div className="group">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Credits</label>
                        <input type="number" className="w-full bg-transparent border-b-2 border-gray-200 py-4 text-2xl font-bold focus:border-electric outline-none transition-all" placeholder="60" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 flex gap-6">
                    <button onClick={() => setStep(1)} className="text-gray-400 font-black uppercase tracking-widest text-sm hover:text-navy transition-colors">Go Back</button>
                    <button onClick={() => setStep(3)} className="bg-navy text-white px-12 py-6 rounded-2xl font-black text-xl flex items-center gap-4 hover:bg-electric transition-all shadow-2xl">
                      Next Step <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-12">
                  <header>
                    <div className="inline-flex items-center gap-2 text-electric font-black text-[10px] uppercase tracking-[0.3em] mb-4">
                      <Banknote className="w-3 h-3" /> Step 03 / 04
                    </div>
                    <h3 className="text-serif text-6xl text-navy mb-6 leading-tight">Financial <span className="italic">Status.</span></h3>
                    <p className="text-gray-400 text-lg font-medium">Needed for equity-based grant adjustments.</p>
                  </header>
                  
                  <div className="space-y-10">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Annual Household Income ($)</label>
                      <input type="number" className="w-full bg-transparent border-b-2 border-gray-200 py-4 text-3xl font-bold focus:border-electric outline-none transition-all" placeholder="0.00" />
                    </div>
                  </div>

                  <div className="pt-10 flex gap-6">
                    <button onClick={() => setStep(2)} className="text-gray-400 font-black uppercase tracking-widest text-sm hover:text-navy transition-colors">Go Back</button>
                    <button onClick={() => setStep(4)} className="bg-navy text-white px-12 py-6 rounded-2xl font-black text-xl flex items-center gap-4 hover:bg-electric transition-all shadow-2xl">
                      Upload Files <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-12">
                  <header>
                    <div className="inline-flex items-center gap-2 text-electric font-black text-[10px] uppercase tracking-[0.3em] mb-4">
                      <Upload className="w-3 h-3" /> Step 04 / 04
                    </div>
                    <h3 className="text-serif text-6xl text-navy mb-6 leading-tight">Verification <span className="italic">Vault.</span></h3>
                    <p className="text-gray-400 text-lg font-medium">Upload high-resolution scans for precise extraction.</p>
                  </header>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {[
                      { id: 'transcript', label: 'Academic Transcript' },
                      { id: 'essay', label: 'Personal Statement' },
                      { id: 'income', label: 'Financial Records' }
                    ].map((doc) => (
                      <div key={doc.id} className="relative group p-8 rounded-[2rem] bg-white border-2 border-dashed border-gray-100 hover:border-electric hover:bg-white transition-all shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-alabaster rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-electric transition-colors">
                              <Upload className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-black text-navy text-lg">{doc.label}</h4>
                              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">PDF format preferred</p>
                            </div>
                          </div>
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)} />
                          {files[doc.id] && <div className="flex items-center gap-2 text-green-500 font-bold text-sm bg-green-50 px-4 py-2 rounded-full animate-in fade-in scale-in"><CheckCircle2 className="w-4 h-4" /> Verified</div>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-navy p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="text-electric w-5 h-5 fill-current" />
                        <h4 className="font-black text-xl uppercase tracking-tighter">Ready to evaluate</h4>
                      </div>
                      <p className="text-blue-100/40 text-sm font-medium">Click to initiate the multi-agent reasoning chain.</p>
                    </div>
                    <button 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="relative z-10 w-full md:w-auto bg-electric text-white px-16 py-7 rounded-2xl font-black text-2xl flex items-center justify-center gap-4 shadow-2xl shadow-electric/30 hover:scale-105 active:scale-95 transition-all"
                    >
                      {isSubmitting ? <Loader2 className="w-8 h-8 animate-spin" /> : "Initiate AI"}
                    </button>
                  </div>
                  
                  <div className="flex justify-center">
                    <button onClick={() => setStep(3)} className="text-gray-400 font-black uppercase tracking-widest text-xs hover:text-navy transition-colors">Review Financials</button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// --- Cinematic Status Page ---
const StatusPage = () => (
  <PageWrapper>
    <div className="min-h-screen bg-navy text-white flex flex-col items-center justify-center p-8 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-electric rounded-full blur-[120px] animate-pulse" />
      </div>
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 text-center"
      >
        <div className="w-32 h-32 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center mb-12 mx-auto border border-white/20 shadow-2xl">
          <Zap className="text-electric w-16 h-16 fill-current" />
        </div>
        
        <h1 className="text-serif text-6xl md:text-7xl mb-6 leading-none">Processing <br /> <span className="italic font-light text-electric">Intelligence.</span></h1>
        <p className="text-xl text-blue-100/60 max-w-xl mx-auto leading-relaxed mb-16 font-medium">
          Our multi-agent system is currently dissecting your academic records and performing cross-verification.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mx-auto">
          {[
            { label: 'Triage', status: 'Complete', active: false },
            { label: 'Doc Intel', status: 'Running', active: true },
            { label: 'Scoring', status: 'Queued', active: false }
          ].map((item, i) => (
            <div key={i} className={`p-8 rounded-[2.5rem] border transition-all duration-700 ${item.active ? 'bg-electric/20 border-electric shadow-[0_0_50px_rgba(0,102,255,0.2)]' : 'bg-white/5 border-white/10'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-50">{item.label}</p>
              <p className={`text-lg font-black ${item.active ? 'text-white' : 'text-gray-400'}`}>{item.status}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-20 flex items-center justify-center gap-8">
          <Link to="/" className="text-sm font-black text-gray-500 hover:text-white transition-colors uppercase tracking-[0.4em]">Exit Session</Link>
          <div className="w-1.5 h-1.5 bg-gray-700 rounded-full" />
          <Link to="/trace/demo" className="text-sm font-black text-electric hover:text-white transition-all uppercase tracking-[0.4em] flex items-center gap-3 group">
            Live Trace <Activity className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </Link>
        </div>
      </motion.div>
    </div>
  </PageWrapper>
);

function App() {
  const location = useLocation();
  
  return (
    <div className="w-full h-full">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/apply" element={<StudentPortal />} />
          <Route path="/status/:runId" element={<StatusPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/trace/:runId" element={<TraceUI />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

const AdminDashboard = () => <div className="pt-32 p-16"><h1 className="text-serif text-5xl">Admin</h1><p className="text-gray-400 mt-4">Restricted Access</p></div>;
const TraceUI = () => <div className="pt-32 p-16"><h1 className="text-serif text-5xl">Trace</h1><p className="text-gray-400 mt-4">System Telemetry</p></div>;

export default function Root() {
  return (
    <Router>
      <App />
    </Router>
  );
}
