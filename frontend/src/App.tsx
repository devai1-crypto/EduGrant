import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Zap, ArrowRight, CheckCircle2, 
  Upload, Star, Activity, ChevronLeft, ChevronRight, Sparkles,
  Calendar, RotateCcw, Plus, FileText, User, X,
  LayoutDashboard, Search, Filter, ArrowUpRight, ShieldCheck, Clock,
  Banknote, BookOpen, Fingerprint, Award, Wallet, Loader2
} from 'lucide-react';

// --- Shared Layout Wrapper ---
const PageWrapper = ({ children, bg = "bg-[#F8F9FA]" }: { children: React.ReactNode, bg?: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
    className={`w-full min-h-screen ${bg}`}
  >
    {children}
  </motion.div>
);

// --- Sophisticated Navigation ---
const Navbar = () => {
  const location = useLocation();
  const path = location?.pathname || '';
  const isApplyPage = path.startsWith('/apply') || path.startsWith('/status');
  
  if (isApplyPage) return null;

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <GraduationCap className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tight text-navy uppercase">EduGrant <span className="text-electric">AI</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
          <Link to="/admin" className="hover:text-navy transition-colors flex items-center gap-2 font-black cursor-pointer"><LayoutDashboard className="w-3 h-3" /> Dashboard</Link>
          <a href="#" className="hover:text-navy transition-colors cursor-pointer">Intelligence</a>
          <a href="#" className="hover:text-navy transition-colors cursor-pointer">Institutions</a>
        </div>
        <Link to="/apply" className="px-6 py-2.5 rounded-full text-xs font-black bg-navy text-white shadow-xl hover:bg-electric transition-all active:scale-95 uppercase tracking-widest cursor-pointer">
          Apply Now
        </Link>
      </div>
    </nav>
  );
};

// --- Landing Page ---
const LandingPage = () => (
  <PageWrapper>
    <div className="pt-32 pb-24 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-electric animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Intelligent Admissions v1.0</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-serif text-7xl md:text-8xl leading-[1.05] text-navy mb-8">
              Excellence <br /> <span className="italic font-light text-electric">Automated.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg text-gray-500 max-w-lg leading-relaxed mb-12 font-medium opacity-80">
              The world's first multi-agent platform for institutional scholarship evaluation. 
            </motion.p>
            <Link to="/apply" className="inline-flex bg-navy text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest items-center gap-3 hover:shadow-2xl hover:bg-black transition-all group cursor-pointer">
              Begin Application <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
          <div className="lg:col-span-5">
             <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-[-40px_40px_80px_rgba(0,0,0,0.08)] border-[8px] border-white">
              <img src="/hero.png" alt="Excellence" className="w-full h-full object-cover scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageWrapper>
);

// --- Student Portal (Full Premium Concierge Flow) ---
const StudentPortal = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', email: '', dob: '', nationality: 'United States',
    studentId: '', institution: '', gpa: '', credits: '', income: ''
  });
  
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    transcript: null, id: null, income: null, essay: null
  });

  const handleFileChange = (type: string, file: File | null) => {
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleFinalSubmit = () => {
    if (step !== 5) return;
    setIsSubmitting(true);
    setTimeout(() => navigate('/status/run_829411'), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleFinalSubmit();
    }
  };

  return (
    <PageWrapper>
      <div className="pt-12 pb-20 px-8">
        <div className="max-w-3xl mx-auto">
          
          <div className="mb-12 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-gray-400 font-black hover:text-navy transition-colors text-[10px] uppercase tracking-[0.3em] cursor-pointer group">
              <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Back to Home
            </Link>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className={`w-8 h-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-navy' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>

          <motion.div 
            layout
            className="bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.04)] border border-gray-100 p-12 md:p-16 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F8F9FA] rounded-bl-[5rem]" />
            <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
              
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                    <header>
                      <div className="flex items-center gap-3 text-electric mb-3">
                         <Fingerprint className="w-5 h-5" />
                         <span className="text-[9px] font-black uppercase tracking-[0.4em]">Section 01</span>
                      </div>
                      <h2 className="text-serif text-5xl text-navy">Identity</h2>
                    </header>

                    <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-8">
                        <div className="col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5 block">Legal Full Name</label>
                          <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm font-medium focus:border-navy outline-none transition-all" placeholder="Alexander Hamilton" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5 block">Email Address</label>
                          <input type="email" className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm font-medium focus:border-navy outline-none" placeholder="name@edu.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5 block">Date of Birth</label>
                          <div className="relative">
                            <input type="date" className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm font-medium focus:border-navy outline-none cursor-pointer" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5 block">Nationality</label>
                          <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm font-medium focus:border-navy outline-none" placeholder="United States" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5 block">Student ID (Optional)</label>
                          <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm font-medium focus:border-navy outline-none" placeholder="SID-88291" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                    <header>
                      <div className="flex items-center gap-3 text-electric mb-3">
                         <Award className="w-5 h-5" />
                         <span className="text-[9px] font-black uppercase tracking-[0.4em]">Section 02</span>
                      </div>
                      <h2 className="text-serif text-5xl text-navy">Academic</h2>
                    </header>

                    <div className="space-y-8">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5 block">Institution</label>
                        <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm font-medium focus:border-navy outline-none" placeholder="Stanford University" value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5 block">Cumulative GPA</label>
                          <input type="number" step="0.01" className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm font-medium focus:border-navy outline-none" placeholder="4.00" value={formData.gpa} onChange={e => setFormData({...formData, gpa: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5 block">Credits Completed</label>
                          <input type="number" className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm font-medium focus:border-navy outline-none" placeholder="60" value={formData.credits} onChange={e => setFormData({...formData, credits: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                    <header>
                      <div className="flex items-center gap-3 text-electric mb-3">
                         <Wallet className="w-5 h-5" />
                         <span className="text-[9px] font-black uppercase tracking-[0.4em]">Section 03</span>
                      </div>
                      <h2 className="text-serif text-5xl text-navy">Financial</h2>
                    </header>

                    <div className="space-y-8">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5 block">Annual Household Income (USD)</label>
                        <div className="relative">
                          <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <input type="number" className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-5 py-3.5 text-sm font-medium focus:border-navy outline-none" placeholder="0.00" value={formData.income} onChange={e => setFormData({...formData, income: e.target.value})} />
                        </div>
                      </div>
                      <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4">
                         <ShieldCheck className="text-blue-500 w-5 h-5 flex-shrink-0" />
                         <p className="text-[10px] text-blue-600 font-medium leading-relaxed uppercase tracking-widest">Data Encrypted: Used solely for equity-based scoring.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                    <header>
                      <div className="flex items-center gap-3 text-electric mb-3">
                         <Zap className="w-5 h-5" />
                         <span className="text-[9px] font-black uppercase tracking-[0.4em]">Section 04</span>
                      </div>
                      <h2 className="text-serif text-5xl text-navy">The Vault</h2>
                    </header>

                    <div className="space-y-6">
                       <div className="p-10 border-2 border-dashed border-gray-100 rounded-[2rem] bg-[#FAFAFA] text-center group hover:border-navy transition-all cursor-pointer relative">
                        <Upload className="w-10 h-10 text-gray-300 mb-4 mx-auto group-hover:text-navy transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-navy block">Click to upload official transcript</span>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileChange('transcript', e.target.files?.[0] || null)} />
                        {files.transcript && <div className="mt-4 text-green-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> {files.transcript.name}</div>}
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                         {[
                           { id: 'id', label: 'Identity Proof', icon: User },
                           { id: 'income', label: 'Income Verification', icon: Banknote },
                           { id: 'recommendation', label: 'Recommendation Letter', icon: FileText },
                           { id: 'essay', label: 'Personal Essay', icon: Plus }
                         ].map(doc => (
                          <div key={doc.id} className="relative flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-navy transition-all shadow-sm group cursor-pointer overflow-hidden">
                             <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-alabaster rounded-xl flex items-center justify-center text-gray-300 group-hover:text-navy transition-colors">
                                 <doc.icon className="w-5 h-5" />
                               </div>
                               <div>
                                 <h4 className="text-[10px] font-black uppercase tracking-widest text-navy">{doc.label}</h4>
                               </div>
                             </div>
                             <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileChange(doc.id, e.target.files?.[0] || null)} />
                             {files[doc.id] && <CheckCircle2 className="text-green-500 w-4 h-4" />}
                          </div>
                         ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 5 && (
                  <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                    <header>
                      <div className="flex items-center gap-3 text-electric mb-3">
                         <Sparkles className="w-5 h-5" />
                         <span className="text-[9px] font-black uppercase tracking-[0.4em]">Section 05</span>
                      </div>
                      <h2 className="text-serif text-5xl text-navy">Review</h2>
                    </header>

                    <div className="space-y-6">
                       {[
                         { id: 1, label: 'Identity', data: [ { l: 'Name', v: formData.fullName }, { l: 'Email', v: formData.email }, { l: 'Nationality', v: formData.nationality }, { l: 'Student ID', v: formData.studentId } ] },
                         { id: 2, label: 'Academic', data: [ { l: 'Institution', v: formData.institution }, { l: 'GPA', v: formData.gpa } ] },
                         { id: 3, label: 'Financial', data: [ { l: 'Annual Income', v: `$${formData.income}` } ] }
                       ].map(section => (
                         <div key={section.id} className="p-8 bg-alabaster rounded-3xl border border-gray-100 group relative hover:border-navy transition-all">
                            <button type="button" onClick={() => setStep(section.id)} className="absolute top-6 right-6 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-navy transition-colors">
                              <RotateCcw className="w-3 h-3" /> Edit Section
                            </button>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">{section.label}</h3>
                            <div className="grid grid-cols-2 gap-8">
                               {section.data.map((d, i) => (
                                 <div key={i}>
                                    <span className="block text-[8px] font-black uppercase text-gray-400 mb-1">{d.l}</span>
                                    <span className="text-sm font-medium text-navy">{d.v || 'Not provided'}</span>
                                 </div>
                               ))}
                            </div>
                         </div>
                       ))}

                       <div className="p-8 bg-alabaster rounded-3xl border border-gray-100 group relative hover:border-navy transition-all">
                          <button type="button" onClick={() => setStep(4)} className="absolute top-6 right-6 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-navy transition-colors">
                            <RotateCcw className="w-3 h-3" /> Edit Section
                          </button>
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Documents</h3>
                          <div className="flex flex-wrap gap-2">
                             {Object.entries(files).map(([id, file]) => (
                               file && <div key={id} className="px-4 py-2 bg-white rounded-xl border border-gray-100 text-[9px] font-black uppercase tracking-widest text-navy flex items-center gap-2">
                                 <CheckCircle2 className="w-3 h-3 text-green-500" /> {id}
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-12 flex items-center justify-between border-t border-gray-50">
                <div className="flex gap-3">
                  <button type="button" className="px-6 py-3 bg-[#F1F3F5] text-navy rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all cursor-pointer">Draft</button>
                  <button type="button" className="px-6 py-3 bg-[#E9ECEF] text-navy rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all cursor-pointer">Restore</button>
                </div>
                
                <div className="flex gap-4 items-center">
                   {step > 1 && (
                     <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 bg-[#F1F3F5] text-navy rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all cursor-pointer flex items-center gap-2">
                       <ChevronLeft className="w-3.5 h-3.5" /> Previous
                     </button>
                   )}
                    {step < 5 ? (
                    <button 
                      key="next-button"
                      type="button" 
                      onClick={() => setStep(step + 1)} 
                      className="px-10 py-3 bg-[#D4A373] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#D4A373]/20 cursor-pointer flex items-center gap-3"
                    >
                      {step === 4 ? 'Review Application' : 'Next Section'} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                   ) : (
                    <button 
                      key="submit-button"
                      type="button" 
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting} 
                      className="px-10 py-3 bg-navy text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl cursor-pointer flex items-center gap-3"
                    >
                      {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Sparkles className="w-3.5 h-3.5 text-electric" /> Create Application</>}
                    </button>
                   )}
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
};

// --- Cinematic Status Page ---
const StatusPage = () => {
  const [progress, setProgress] = useState(1);
  useEffect(() => {
    const t1 = setTimeout(() => setProgress(2), 3000);
    const t2 = setTimeout(() => setProgress(3), 7000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <PageWrapper bg="bg-navy">
      <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-electric/10 rounded-full blur-[120px] animate-pulse" />
        
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 w-full max-w-4xl text-center">
          <div className="w-20 h-20 bg-white/5 backdrop-blur-2xl rounded-[2rem] flex items-center justify-center mb-12 mx-auto border border-white/10 shadow-2xl">
            <Zap className="text-electric w-8 h-8 fill-current" />
          </div>
          <h1 className="text-serif text-6xl text-white mb-6">Evaluating <br /><span className="italic font-light text-electric">Intelligence.</span></h1>
          <div className="mt-16 flex items-center justify-between max-w-2xl mx-auto relative px-4">
             <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2" />
             <div className="absolute top-1/2 left-0 h-[1px] bg-electric -translate-y-1/2 transition-all duration-1000" style={{ width: progress === 1 ? '0%' : progress === 2 ? '50%' : '100%' }} />
             {[
               { id: 1, label: 'Received' },
               { id: 2, label: 'Reviewing' },
               { id: 3, label: 'Action Needed' },
               { id: 4, label: 'Decided' }
             ].map((s) => (
               <div key={s.id} className="relative z-10 flex flex-col items-center gap-4">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-700 ${progress >= s.id ? 'bg-electric border-electric text-white' : 'bg-navy border-white/20 text-white/20'}`}>
                    {progress > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.id}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${progress >= s.id ? 'text-white' : 'text-white/20'}`}>{s.label}</span>
               </div>
             ))}
          </div>
          <div className="mt-24 flex items-center justify-center gap-8">
            <Link to="/" className="text-[10px] font-black text-gray-500 hover:text-white transition-colors uppercase tracking-[0.4em] cursor-pointer">Exit Session</Link>
            <div className="w-1 h-1 bg-gray-800 rounded-full" />
            <Link to="/trace/run_829411" className="text-[10px] font-black text-electric hover:text-white transition-all uppercase tracking-[0.4em] flex items-center gap-2 group cursor-pointer">
              View Agent Trace <Activity className="w-4 h-4 group-hover:rotate-12 transition-all" />
            </Link>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

// --- Trace UI ---
const TraceUI = () => {
  const nodes = [
    { id: 'triage', label: 'Triage Agent', status: 'OK' },
    { id: 'docintel', label: 'Doc Intelligence', status: 'ACTIVE' },
    { id: 'eligibility', label: 'Eligibility Scoring', status: 'WAIT' },
    { id: 'decision', label: 'Final Decision', status: 'WAIT' }
  ];

  return (
    <PageWrapper bg="bg-navy">
      <div className="min-h-screen pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-160px)]">
          <header className="mb-12 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-electric rounded-xl flex items-center justify-center"><Activity className="text-white w-5 h-5" /></div>
              <div>
                <h1 className="text-serif text-3xl text-white">Agent Trace UI</h1>
                <p className="text-[9px] font-black text-electric uppercase tracking-[0.3em]">Runtime: run_829411</p>
              </div>
            </div>
            <Link to="/admin" className="text-[10px] font-black text-white/50 hover:text-white uppercase tracking-widest border border-white/10 px-6 py-2.5 rounded-full cursor-pointer">Close Trace</Link>
          </header>
          <div className="flex-1 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 relative overflow-hidden flex items-center justify-center p-20">
             <div className="relative flex items-center gap-32">
                {nodes.map((node, i) => (
                  <div key={node.id} className="relative flex flex-col items-center gap-6">
                    <motion.div animate={node.status === 'ACTIVE' ? { scale: [1, 1.05, 1], borderColor: ['rgba(0,102,255,0.2)', 'rgba(0,102,255,1)', 'rgba(0,102,255,0.2)'] } : {}} transition={{ duration: 2, repeat: Infinity }} className={`w-40 h-40 rounded-[2.5rem] border-2 flex flex-col items-center justify-center gap-4 transition-all duration-700 ${node.status === 'OK' ? 'border-green-500 bg-green-500/5' : node.status === 'ACTIVE' ? 'border-electric bg-electric/10' : 'border-white/10 bg-white/5'}`}>
                      {node.status === 'OK' ? <ShieldCheck className="text-green-500 w-8 h-8" /> : node.status === 'ACTIVE' ? <Zap className="text-electric w-8 h-8 animate-pulse" /> : <Clock className="text-white/20 w-8 h-8" />}
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white text-center px-4">{node.label}</span>
                    </motion.div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

// --- Admin Dashboard ---
const AdminDashboard = () => (
  <PageWrapper>
    <div className="pt-24 pb-12 px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex items-center justify-between">
           <div>
              <h1 className="text-serif text-4xl text-navy">Application Queue</h1>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Manage institutional funding requests</p>
           </div>
           <button className="bg-white border border-gray-100 p-2.5 rounded-xl text-navy hover:bg-gray-50 transition-all cursor-pointer"><Filter className="w-5 h-5" /></button>
        </header>
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
           <table className="w-full text-left">
              <thead><tr className="border-b border-gray-50">{['Student', 'GPA', 'AI Score', 'Recommendation', 'Action'].map(h => (<th key={h} className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{h}</th>))}</tr></thead>
              <tbody>{[ { name: 'John Doe', gpa: '3.94', score: 92, status: 'Auto-Approve' }, { name: 'Jane Smith', gpa: '3.88', score: 88, status: 'Review' } ].map((row, i) => (<tr key={i} className="group border-b border-gray-50 hover:bg-gray-50/50 transition-all"><td className="px-8 py-6 font-black text-navy text-sm">{row.name}</td><td className="px-8 py-6 text-sm font-medium text-gray-600">{row.gpa}</td><td className="px-8 py-6 text-electric font-black text-sm">{row.score}</td><td className="px-8 py-6"><span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${row.status === 'Auto-Approve' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>{row.status}</span></td><td className="px-8 py-6"><Link to="/trace/run_829411" className="p-2.5 bg-gray-50 rounded-lg text-navy hover:bg-navy hover:text-white transition-all cursor-pointer inline-flex"><Activity className="w-3.5 h-3.5" /></Link></td></tr>))}</tbody>
           </table>
        </div>
      </div>
    </div>
  </PageWrapper>
);

function App() {
  const location = useLocation();
  return (
    <div className="w-full min-h-screen font-sans overflow-x-hidden bg-[#FAFAF9]">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location?.pathname || 'default'}>
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

export default function Root() {
  return (
    <Router>
      <App />
    </Router>
  );
}
