import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Zap, Clock } from 'lucide-react';
import { PageWrapper } from '../../components/PageWrapper';
import { api } from '../../lib/api';
import type { AgentEvent, AgentRunState } from '../../types/api';

export const TraceUI = () => {
  const { runId } = useParams();
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [state, setState] = useState<AgentRunState | null>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) return;

    const fetchData = async () => {
      try {
        const [eventsData, stateData] = await Promise.all([
          api.getRunEvents(runId),
          api.getRunState(runId)
        ]);
        setEvents(eventsData);
        setState(stateData);
        
        // Find current active node
        const lastStart = [...eventsData].reverse().find(e => e.event_type === 'start');
        const lastEnd = [...eventsData].reverse().find(e => e.event_type === 'end' && e.node_name === lastStart?.node_name);
        
        if (lastStart && !lastEnd) {
          setActiveNode(lastStart.node_name);
        } else {
          setActiveNode(null);
        }
      } catch (error) {
        console.error('Failed to fetch trace data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [runId]);

  const nodes = [
    { id: 'triage', label: 'Triage Agent' },
    { id: 'doc_intel', label: 'Doc Intelligence' },
    { id: 'eligibility', label: 'Eligibility Scoring' },
    { id: 'outreach', label: 'Outreach Agent' },
    { id: 'decision', label: 'Final Decision' }
  ];

  const getNodeStatus = (nodeId: string) => {
    const isCompleted = events.some(e => e.node_name === nodeId && e.event_type === 'end');
    const isActive = activeNode === nodeId;
    if (isCompleted) return 'OK';
    if (isActive) return 'ACTIVE';
    return 'WAIT';
  };

  return (
    <PageWrapper bg="bg-[#001F3F]">
      <div className="min-h-screen pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-160px)]">
          <header className="mb-12 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#0066FF] rounded-xl flex items-center justify-center">
                <Activity className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-serif text-3xl text-white">Agent Trace UI</h1>
                <p className="text-[9px] font-black text-[#0066FF] uppercase tracking-[0.3em]">Runtime: {runId}</p>
              </div>
            </div>
            <Link to="/admin" className="text-[10px] font-black text-white/50 hover:text-white uppercase tracking-widest border border-white/10 px-6 py-2.5 rounded-full cursor-pointer">Close Trace</Link>
          </header>
          
          <div className="flex-1 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 relative overflow-hidden flex flex-col p-12">
             <div className="flex-1 flex items-center justify-center overflow-x-auto">
                <div className="relative flex items-center gap-24">
                  {nodes.map((node, i) => {
                    const status = getNodeStatus(node.id);
                    return (
                      <div key={node.id} className="relative flex flex-col items-center gap-6">
                        {i < nodes.length - 1 && (
                            <div className="absolute left-[100%] top-1/2 w-24 h-[1px] bg-white/10 -translate-y-1/2">
                                <motion.div 
                                    className="h-full bg-[#0066FF]"
                                    initial={{ width: 0 }}
                                    animate={{ width: status === 'OK' ? '100%' : '0%' }}
                                />
                            </div>
                        )}
                        <motion.div 
                          animate={status === 'ACTIVE' ? { 
                            scale: [1, 1.05, 1], 
                            borderColor: ['rgba(0,102,255,0.2)', 'rgba(0,102,255,1)', 'rgba(0,102,255,0.2)'] 
                          } : {}} 
                          transition={{ duration: 2, repeat: Infinity }} 
                          className={`w-32 h-32 rounded-[2.5rem] border-2 flex flex-col items-center justify-center gap-4 transition-all duration-700 ${status === 'OK' ? 'border-green-500 bg-green-500/5' : status === 'ACTIVE' ? 'border-[#0066FF] bg-[#0066FF]/10' : 'border-white/10 bg-white/5'}`}
                        >
                          {status === 'OK' ? <ShieldCheck className="text-green-500 w-8 h-8" /> : status === 'ACTIVE' ? <Zap className="text-[#0066FF] w-8 h-8 animate-pulse" /> : <Clock className="text-white/20 w-8 h-8" />}
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white text-center px-4">{node.label}</span>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
             </div>

             <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 h-48">
                <div className="bg-black/20 rounded-2xl border border-white/5 p-6 overflow-y-auto">
                    <h3 className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-4">Event Stream</h3>
                    <div className="space-y-3">
                        {events.map((e, i) => (
                            <div key={i} className="flex items-start gap-3 text-[9px]">
                                <span className="text-white/20 font-mono mt-0.5">{new Date(e.created_at).toLocaleTimeString()}</span>
                                <span className={e.event_type === 'start' ? 'text-[#0066FF]' : 'text-green-500'}>
                                    {e.event_type.toUpperCase()}
                                </span>
                                <span className="text-white font-bold">{e.node_name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-2 bg-black/20 rounded-2xl border border-white/5 p-6 overflow-y-auto">
                    <h3 className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-4">Live State JSON</h3>
                    <pre className="text-[10px] text-[#0066FF] font-mono">
                        {JSON.stringify(state, null, 2)}
                    </pre>
                </div>
             </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
