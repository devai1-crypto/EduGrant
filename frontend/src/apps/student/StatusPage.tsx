import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2, Activity, ShieldAlert } from 'lucide-react';
import { PageWrapper } from '../../components/PageWrapper';
import { api } from '../../lib/api';
import type { ApplicationStatus } from '../../types/api';

export const StatusPage = () => {
  const { runId } = useParams();
  const [searchParams] = useSearchParams();
  const appId = searchParams.get('appId');
  const [status, setStatus] = useState<ApplicationStatus | null>(null);
  const [progress, setProgress] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!appId) {
      setIsLoading(false);
      setError('No Application ID provided');
      return;
    }

    const fetchStatus = async () => {
      try {
        const data = await api.getApplicationStatus(appId);
        setStatus(data);
        setError(null);
        
        const nodeMap: { [key: string]: number } = {
          'received': 1,
          'triage': 2,
          'doc_intel': 2,
          'eligibility': 3,
          'outreach': 3,
          'decision': 4,
          'completed': 4
        };
        
        if (data.status === 'completed' || data.status === 'approved' || data.status === 'rejected') {
            setProgress(4);
        } else {
            setProgress(nodeMap[data.current_node] || 1);
        }
      } catch (err: any) {
        console.error('Failed to fetch status:', err);
        if (isLoading) setError('Application not found or connection error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [appId]);

  const copyId = () => {
    if (appId) {
      navigator.clipboard.writeText(appId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <PageWrapper bg="bg-[#001F3F]">
      <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#0066FF]/10 rounded-full blur-[120px] animate-pulse" />
        
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 w-full max-w-4xl text-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-6">
              <Activity className="w-12 h-12 text-[#0066FF] animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Securing your application...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-8">
              <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center border border-red-500/20">
                <ShieldAlert className="text-red-500 w-8 h-8" />
              </div>
              <div>
                <h1 className="text-serif text-5xl text-white mb-4">Access <span className="italic font-light text-red-500">Denied.</span></h1>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{error}</p>
              </div>
              <Link to="/" className="px-8 py-4 bg-white text-[#001F3F] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Return to Home</Link>
            </div>
          ) : (
            <>
              <div className="w-24 h-24 bg-green-500/10 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center mb-12 mx-auto border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                <CheckCircle2 className="text-green-500 w-10 h-10" />
              </div>
              <h1 className="text-serif text-6xl text-white mb-6">Thank You <br /><span className="italic font-light text-[#0066FF]">for Applying.</span></h1>
              <p className="text-white/40 text-sm font-medium max-w-lg mx-auto leading-relaxed mb-8">
                Your application has been successfully received. Our automated verification system is currently reviewing your documents. We will get back to you via email shortly.
              </p>
            </>
          )}
          
          {!isLoading && !error && (
            <>
          <div className="mt-16 flex items-center justify-between max-w-2xl mx-auto relative px-4">
             <div className="absolute top-[20px] left-0 w-full h-[1px] bg-white/10" />
             <div className="absolute top-[20px] left-0 h-[1px] bg-[#0066FF] transition-all duration-1000 shadow-[0_0_10px_#0066FF]" style={{ width: `${((progress - 1) / 3) * 100}%` }} />
             {[
               { id: 1, label: 'RECEIVED' },
               { id: 2, label: 'REVIEWING' },
               { id: 3, label: 'ACTION NEEDED' },
               { id: 4, label: 'DECIDED' }
             ].map((s) => (
               <div key={s.id} className="relative z-10 flex flex-col items-center gap-4">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-700 ${progress >= s.id ? 'bg-[#0066FF] border-[#0066FF] text-white shadow-[0_0_15px_rgba(0,102,255,0.5)]' : 'bg-[#001F3F] border-white/20 text-white/20'}`}>
                    {progress > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.id}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${progress >= s.id ? 'text-white' : 'text-white/20'}`}>{s.label}</span>
               </div>
             ))}
          </div>


          {progress === 3 && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-16 max-w-xl mx-auto bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl text-left">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-[#FF3B30]/20 rounded-full flex items-center justify-center text-[#FF3B30]">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-xs font-black uppercase tracking-widest text-white">Action Required</h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">AI Intelligence flags missing data</p>
                    </div>
                </div>
                
                <div className="space-y-4 mb-8">
                    {status?.missing_fields.map((field, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{field.replace(/_/g, ' ')}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#0066FF]">Required</span>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={async () => {
                        if (!appId) return;
                        await api.studentReply(appId, { attachments: ['resumed_document.pdf'] });
                        window.location.reload();
                    }}
                    className="w-full py-4 bg-white text-[#001F3F] rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-200 transition-all shadow-xl">
                    Resolve & Resume Extraction
                </button>
            </motion.div>
          )}


          <div className="mt-24 flex flex-col items-center gap-8">
             <div className="px-8 py-5 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-xl relative group min-w-[320px]">
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 block mb-3 text-center">Application Reference</span>
                <div className="flex items-center justify-between gap-4">
                  <code className="text-sm font-black text-[#0066FF] tracking-[0.3em]">{appId?.slice(0, 8).toUpperCase()}</code>
                  <button 
                    onClick={copyId}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Activity className="w-4 h-4 rotate-90" />}
                  </button>
                </div>
                {copied && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#0066FF] text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-xl">
                    Copied to clipboard
                  </motion.div>
                )}
             </div>

             <div className="flex items-center justify-center gap-8">
                <Link to="/" className="text-[10px] font-black text-gray-500 hover:text-white transition-colors uppercase tracking-[0.4em] cursor-pointer">Exit Session</Link>
             </div>
          </div>

            </>
          )}
        </motion.div>
      </div>
    </PageWrapper>
  );
};
