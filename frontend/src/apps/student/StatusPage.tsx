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

  useEffect(() => {
    if (!appId) return;

    const fetchStatus = async () => {
      try {
        const data = await api.getApplicationStatus(appId);
        setStatus(data);
        
        // Map status/node to progress step
        const nodeMap: { [key: string]: number } = {
          'received': 1,
          'triage': 2,
          'doc_intel': 2,
          'eligibility': 3,
          'outreach': 3,
          'decision': 4,
          'completed': 4
        };
        
        if (data.status === 'completed') {
            setProgress(4);
        } else {
            setProgress(nodeMap[data.current_node] || 1);
        }
      } catch (error) {
        console.error('Failed to fetch status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [appId]);

  return (
    <PageWrapper bg="bg-[#001F3F]">
      <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#0066FF]/10 rounded-full blur-[120px] animate-pulse" />
        
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 w-full max-w-4xl text-center">
          <div className="w-20 h-20 bg-white/5 backdrop-blur-2xl rounded-[2rem] flex items-center justify-center mb-12 mx-auto border border-white/10 shadow-2xl">
            <Zap className="text-[#0066FF] w-8 h-8 fill-current" />
          </div>
          <h1 className="text-serif text-6xl text-white mb-6">Evaluating <br /><span className="italic font-light text-[#0066FF]">Intelligence.</span></h1>
          
          <div className="mt-16 flex items-center justify-between max-w-2xl mx-auto relative px-4">
             <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2" />
             <div className="absolute top-1/2 left-0 h-[1px] bg-[#0066FF] -translate-y-1/2 transition-all duration-1000" style={{ width: `${((progress - 1) / 3) * 100}%` }} />
             {[
               { id: 1, label: 'Received' },
               { id: 2, label: 'Reviewing' },
               { id: 3, label: 'Action Needed' },
               { id: 4, label: 'Decided' }
             ].map((s) => (
               <div key={s.id} className="relative z-10 flex flex-col items-center gap-4">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-700 ${progress >= s.id ? 'bg-[#0066FF] border-[#0066FF] text-white' : 'bg-[#001F3F] border-white/20 text-white/20'}`}>
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
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{field}</span>
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
             <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 block mb-2 text-center">Application Reference</span>
                <code className="text-xs font-black text-[#0066FF] tracking-widest">{appId}</code>
             </div>

             <div className="flex items-center justify-center gap-8">
                <Link to="/" className="text-[10px] font-black text-gray-500 hover:text-white transition-colors uppercase tracking-[0.4em] cursor-pointer">Exit Session</Link>
                <div className="w-1 h-1 bg-gray-800 rounded-full" />
                <Link to={`/trace/${(runId && runId !== 'latest') ? runId : status?.run_id}`} className="text-[10px] font-black text-[#0066FF] hover:text-white transition-all uppercase tracking-[0.4em] flex items-center gap-2 group cursor-pointer">
                  View Agent Trace <Activity className="w-4 h-4 group-hover:rotate-12 transition-all" />
                </Link>
             </div>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};
