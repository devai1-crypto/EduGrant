import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, FileText, CheckCircle2, XCircle, ShieldAlert, Zap, Clock, ShieldCheck, Activity } from 'lucide-react';
import { PageWrapper } from '../../components/PageWrapper';
import { api } from '../../lib/api';

export const ApplicationDetail = () => {
  const { id } = useParams();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [decisionType, setDecisionType] = useState<'approved' | 'rejected'>('approved');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showTrace, setShowTrace] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const data = await api.getApplicationDetail(id);
        setApp(data);
      } catch (error) {
        console.error('Failed to fetch application detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const handleOpenModal = (type: 'approved' | 'rejected') => {
    setDecisionType(type);
    setReason('');
    setShowModal(true);
  };

  const handleSubmitDecision = async () => {
    if (!id || !reason.trim()) return;
    setSubmitting(true);
    try {
        await api.overrideDecision(id, { decision: decisionType, reason });
        const data = await api.getApplicationDetail(id);
        setApp(data);
        setShowModal(false);
    } catch (error) {
        alert('Failed to update decision');
    } finally {
        setSubmitting(false);
    }
  };

  const nodes = [
    { id: 'triage', label: 'Triage' },
    { id: 'doc_intel', label: 'Intelligence' },
    { id: 'eligibility', label: 'Scoring' },
    { id: 'outreach', label: 'Outreach' }
  ];

  const getNodeStatus = (nodeId: string) => {
    const currentRunId = app?.current_state?.run_id;
    if (!currentRunId) return 'WAIT';

    const runEvents = app?.audit_trail?.filter((e: any) => e.run_id === currentRunId) || [];
    
    const isCompleted = runEvents.some((e: any) => e.node_name === nodeId && e.event_type === 'end');
    const lastStart = [...runEvents].reverse().find((e: any) => e.event_type === 'start');
    const isActive = lastStart?.node_name === nodeId && !runEvents.some((e: any) => e.node_name === nodeId && e.event_type === 'end');
    
    if (isCompleted) return 'OK';
    if (isActive) return 'ACTIVE';
    return 'WAIT';
  };


  if (loading) return <PageWrapper><div className="pt-32 text-center font-black uppercase text-xs text-gray-400">Loading details...</div></PageWrapper>;
  if (!app) return <PageWrapper><div className="pt-32 text-center font-black uppercase text-xs text-gray-400">Application not found</div></PageWrapper>;

  return (
    <PageWrapper>
      {/* Decision Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#001F3F]/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg relative z-10 shadow-2xl overflow-hidden border border-white/20">
            <div className={`p-8 ${decisionType === 'approved' ? 'bg-green-50' : 'bg-red-50'} border-b border-gray-100`}>
                <h3 className="text-serif text-2xl text-[#001F3F] mb-1">
                    {decisionType === 'approved' ? 'Approve Application' : 'Reject Application'}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Provide a reason for this manual override
                </p>
            </div>
            <div className="p-8">
                <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter your detailed reasoning here..."
                    className="w-full h-40 bg-gray-50 border border-gray-100 rounded-2xl p-6 text-sm text-[#001F3F] placeholder:text-gray-300 focus:outline-none focus:border-[#0066FF] transition-all resize-none mb-8"
                />
                <div className="flex gap-4">
                    <button 
                        onClick={() => setShowModal(false)}
                        className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all">
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmitDecision}
                        disabled={!reason.trim() || submitting}
                        className={`flex-1 py-4 ${decisionType === 'approved' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}>
                        {submitting ? 'Processing...' : `Confirm ${decisionType}`}
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Trace Command Center Modal */}
      {showTrace && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#001F3F]/90 backdrop-blur-2xl" onClick={() => setShowTrace(false)} />
          <div className="bg-[#050505] rounded-[3rem] w-full max-w-6xl h-[85vh] relative z-10 shadow-[0_0_100px_rgba(0,102,255,0.2)] overflow-hidden border border-white/10 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0066FF] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,102,255,0.4)]">
                        <Activity className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-serif text-2xl text-white">Agent Command Center</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0066FF]">Runtime ID: {app.application?.application_id}</p>
                    </div>
                </div>
                <button onClick={() => setShowTrace(false)} className="p-3 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all">
                    <XCircle className="w-8 h-8" />
                </button>
            </div>

            {/* Visual Graph Header */}
            <div className="p-10 bg-white/[0.01] border-b border-white/5">
                <div className="relative flex items-center justify-between max-w-4xl mx-auto">
                    {nodes.map((node, i) => {
                        const status = getNodeStatus(node.id);
                        return (
                            <div key={node.id} className="relative flex flex-col items-center gap-4">
                                {i < nodes.length - 1 && (
                                    <div className="absolute left-[100%] top-1/2 w-full h-[1px] bg-white/10 -translate-y-1/2">
                                        <div 
                                            className="h-full bg-[#0066FF] transition-all duration-1000 shadow-[0_0_10px_#0066FF]"
                                            style={{ width: status === 'OK' ? '100%' : '0%' }}
                                        />
                                    </div>
                                )}
                                <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-700 ${status === 'OK' ? 'border-green-500 bg-green-500/10 text-green-500' : status === 'ACTIVE' ? 'border-[#0066FF] bg-[#0066FF]/20 text-[#0066FF] animate-pulse' : 'border-white/5 bg-white/5 text-white/20'}`}>
                                    {status === 'OK' ? <ShieldCheck className="w-6 h-6" /> : status === 'ACTIVE' ? <Zap className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                </div>
                                <span className={`text-[7px] font-black uppercase tracking-widest ${status === 'WAIT' ? 'text-white/20' : 'text-white'}`}>{node.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Split Screen Content */}
            <div className="flex-1 overflow-hidden flex">
                {/* Left Panel: Event Stream */}
                <div className="w-1/3 border-r border-white/5 flex flex-col">
                    <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Live Event Stream</h4>
                    </div>
                    <div className="flex-1 overflow-auto p-6 custom-scrollbar space-y-4">
                        {app.audit_trail?.map((event: any, i: number) => (
                            <div key={i} className="group p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-[#0066FF]/30 transition-all">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[9px] font-black text-[#0066FF] uppercase tracking-widest">{event.node_name}</span>
                                    <span className="text-[8px] text-white/20 font-mono">{new Date(event.created_at).toLocaleTimeString()}</span>
                                </div>
                                <div className="text-[10px] text-white/60 font-medium leading-relaxed italic">
                                    {event.event_type === 'start' ? '🚀 Initializing node...' : '✅ Execution completed.'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: State Inspection */}
                <div className="flex-1 flex flex-col bg-black">
                    <div className="p-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Full State Inspection (JSON)</h4>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500/20" />
                            <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
                            <div className="w-2 h-2 rounded-full bg-green-500/20" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                        <pre className="text-[11px] font-mono text-blue-400/80 leading-relaxed">
                            {JSON.stringify(app.current_state, null, 2)}
                        </pre>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-24 pb-12 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-12 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <Link to="/admin" className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-[#001F3F] transition-all">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-serif text-4xl text-[#001F3F]">{app.application?.student_email}</h1>
                    <p className="text-xs font-black text-[#0066FF] uppercase tracking-widest mt-1">ID: {app.application?.application_id}</p>
                </div>
            </div>
            <div className="flex gap-4">
                <button 
                    onClick={() => handleOpenModal('rejected')}
                    className="px-8 py-3 bg-white border border-gray-100 text-[#001F3F] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                    Reject
                </button>
                <button 
                    onClick={() => handleOpenModal('approved')}
                    className="px-8 py-3 bg-[#001F3F] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl">
                    Approve
                </button>
            </div>
          </header>

          {/* Visual Agent Graph */}
          <div className="mb-12 bg-[#001F3F] rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#0066FF]/10 rounded-bl-full blur-3xl" />
             <div className="relative flex items-center justify-between max-w-4xl mx-auto">
                {nodes.map((node, i) => {
                    const status = getNodeStatus(node.id);
                    return (
                        <div key={node.id} className="relative flex flex-col items-center gap-4">
                            {i < nodes.length - 1 && (
                                <div className="absolute left-[100%] top-1/2 w-full h-[1px] bg-white/10 -translate-y-1/2">
                                    <div 
                                        className="h-full bg-[#0066FF] transition-all duration-1000"
                                        style={{ width: status === 'OK' ? '100%' : '0%' }}
                                    />
                                </div>
                            )}
                            <div className={`w-20 h-20 rounded-[1.5rem] border-2 flex items-center justify-center transition-all duration-700 ${status === 'OK' ? 'border-green-500 bg-green-500/10 text-green-500' : status === 'ACTIVE' ? 'border-[#0066FF] bg-[#0066FF]/20 text-[#0066FF] animate-pulse shadow-[0_0_30px_rgba(0,102,255,0.3)]' : 'border-white/5 bg-white/5 text-white/20'}`}>
                                {status === 'OK' ? <ShieldCheck className="w-8 h-8" /> : status === 'ACTIVE' ? <Zap className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-widest transition-all ${status === 'WAIT' ? 'text-white/20' : 'text-white'}`}>{node.label}</span>
                        </div>
                    );
                })}
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-8">
                {/* Extracted Intelligence */}
                <section className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <span className="text-[8px] font-black uppercase text-[#0066FF] bg-blue-50 px-3 py-1 rounded-full">
                            {app.extracted_data ? 'AI Verified' : 'Self-Reported'}
                        </span>
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8">Extracted Intelligence</h3>
                    <div className="grid grid-cols-2 gap-10">
                        <div>
                            <span className="block text-[8px] font-black uppercase text-gray-400 mb-2">Full Name</span>
                            <span className="text-sm font-bold text-[#001F3F]">
                                {app.extracted_data?.student_info?.full_name || app.application?.raw_payload?.full_name || app.application?.raw_payload?.fullName || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-[8px] font-black uppercase text-gray-400 mb-2">Institution</span>
                            <span className="text-sm font-bold text-[#001F3F]">
                                {app.extracted_data?.transcript_info?.institution || app.application?.raw_payload?.institution || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-[8px] font-black uppercase text-gray-400 mb-2">GPA</span>
                            <span className="text-sm font-bold text-[#0066FF]">
                                {app.extracted_data?.transcript_info?.gpa || app.application?.raw_payload?.gpa || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-[8px] font-black uppercase text-gray-400 mb-2">Annual Income</span>
                            <span className="text-sm font-bold text-[#001F3F]">
                                ${app.extracted_data?.income_proof?.annual_income || app.application?.raw_payload?.annual_income || app.application?.raw_payload?.annualIncome || app.application?.raw_payload?.income || 'N/A'}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Attachments */}
                <section className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Verified Vault</h3>
                    
                    {app.extracted_data?.document_quality_flags?.length > 0 && (
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
                            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                            <div>
                                <h4 className="text-[10px] font-black uppercase text-amber-900 tracking-widest mb-1">AI Quality Alert</h4>
                                {app.extracted_data.document_quality_flags.map((flag: string, i: number) => (
                                    <p key={i} className="text-[11px] text-amber-800/80">{flag}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">

                        {app.attachments?.map((at: any, i: number) => {
                            const quality = app.extracted_data?.attachment_qualities?.find((q: any) => q.filename === at.filename);
                            const isValid = quality ? quality.is_valid : true;
                            
                            return (
                                <div 
                                    key={i} 
                                    onClick={() => window.open(at.presigned_url, '_blank')}
                                    className={`flex items-center justify-between p-5 ${isValid ? 'bg-[#FAFAFA]' : 'bg-red-50/50'} rounded-2xl border ${isValid ? 'border-gray-100' : 'border-red-100'} hover:border-[#0066FF] transition-all group cursor-pointer relative overflow-hidden`}
                                >
                                    {!isValid && <div className="absolute top-0 left-0 w-1 h-full bg-red-400" />}
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center ${isValid ? 'text-gray-300' : 'text-red-300'} group-hover:text-[#0066FF] transition-all`}>
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#001F3F] block">{at.filename}</span>
                                            {quality?.reason && (
                                                <span className="text-[8px] font-bold text-red-500 uppercase tracking-tighter mt-1 block">AI Alert: {quality.reason}</span>
                                            )}
                                        </div>
                                    </div>
                                    {isValid ? (
                                        <CheckCircle2 className="text-green-500 w-4 h-4" />
                                    ) : (
                                        <ShieldAlert className="text-red-500 w-4 h-4" />
                                    )}
                                </div>
                            );
                        })}

                        {(!app.attachments || app.attachments.length === 0) && (
                            <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest">No documents uploaded.</div>
                        )}
                    </div>
                </section>
            </div>

            <div className="lg:col-span-5 space-y-8">
                {/* Scoring & Decision */}
                <section className="bg-[#001F3F] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[5rem]" />
                    <div className="flex justify-between items-start mb-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">AI Decision Logic</h3>
                        <div className="flex gap-2">
                            <button 
                                onClick={async () => {
                                    if (!id) return;
                                    try {
                                        await api.reanalyzeApplication(id);
                                        // Refresh data
                                        const data = await api.getApplicationDetail(id);
                                        setApp(data);
                                    } catch (e) { alert('Re-analysis failed'); }
                                }}
                                className="text-[8px] font-black uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-full hover:bg-green-500 transition-all">
                                Re-Analyze
                            </button>
                            <button 
                                onClick={() => setShowTrace(true)}
                                className="text-[8px] font-black uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-full hover:bg-[#0066FF] transition-all">
                                View Full Trace
                            </button>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-8">
                        <span className="text-6xl font-serif text-[#0066FF]">{app.eligibility_result?.eligibility_score || '--'}</span>
                        <span className="text-xs font-black uppercase tracking-widest text-white/40">/ 100</span>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <span className="block text-[8px] font-black uppercase text-white/40 mb-2">Recommendation</span>
                            <span className="inline-block px-4 py-1.5 bg-[#0066FF] rounded-full text-[9px] font-black uppercase tracking-widest">
                                {app.eligibility_result?.recommendation || 'Pending'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-[8px] font-black uppercase text-white/40 mb-2">Reasoning Chain</span>
                            <div className="text-[11px] leading-relaxed text-white/60 whitespace-pre-wrap font-medium">
                                {(app.eligibility_result?.reasoning_chain || 'The AI agents are currently evaluating this application based on merit and financial need metrics.')
                                    .split('\n')
                                    .map((line: string, i: number) => {
                                        if (line.startsWith('###')) {
                                            return <h4 key={i} className="text-white font-black uppercase text-[9px] tracking-widest mt-6 mb-2 border-b border-white/5 pb-1">{line.replace(/###\s?/, '')}</h4>
                                        }
                                        if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                                            return <div key={i} className="flex gap-2 mt-1">
                                                <span className="text-[#0066FF]">•</span>
                                                <span>{line.trim().substring(1).trim()}</span>
                                            </div>
                                        }
                                        return <p key={i} className={line.trim() ? "mt-1" : "h-2"}>{line}</p>
                                    })
                                }
                            </div>

                        </div>

                    </div>
                </section>

                {/* Advanced Agent Trace Section — Boxes + Commands unified */}
                <section className="bg-[#050505] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
                    {/* Section Header */}
                    <div className="flex justify-between items-center px-8 pt-8 pb-6 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <Activity className="w-4 h-4 text-[#0066FF]" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Real-Time Agent Trace</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[8px] font-black uppercase text-green-500 tracking-widest">Live Sync</span>
                        </div>
                    </div>

                    {/* Visual Flow — Boxes */}
                    <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center justify-between relative">
                            {nodes.map((node, i) => {
                                const status = getNodeStatus(node.id);
                                return (
                                    <div key={node.id} className="relative flex flex-col items-center gap-3 flex-1">
                                        {i < nodes.length - 1 && (
                                            <div className="absolute left-1/2 top-6 w-full h-[2px] bg-white/5">
                                                <div className="h-full bg-[#0066FF] transition-all duration-1000" style={{ width: status === 'OK' ? '100%' : '0%' }} />
                                            </div>
                                        )}
                                        <div className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center z-10 transition-all duration-700 ${
                                            status === 'OK' ? 'border-green-500 bg-green-500/10 text-green-500' :
                                            status === 'ACTIVE' ? 'border-[#0066FF] bg-[#0066FF]/20 text-[#0066FF] animate-pulse shadow-[0_0_20px_rgba(0,102,255,0.4)]' :
                                            'border-white/10 bg-white/5 text-white/20'
                                        }`}>
                                            {status === 'OK' ? <ShieldCheck className="w-5 h-5" /> : status === 'ACTIVE' ? <Zap className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                        </div>
                                        <span className={`text-[8px] font-black uppercase tracking-wider ${ status === 'WAIT' ? 'text-white/20' : 'text-white' }`}>{node.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Command Stream + State Inspector side by side */}
                    <div className="grid grid-cols-2 divide-x divide-white/5" style={{height: '280px'}}>
                        <div className="p-5 overflow-y-auto">
                            <h4 className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-3">Command Stream</h4>
                            <div className="space-y-3">
                                {(app.audit_trail?.length ?? 0) === 0 && (
                                    <p className="text-[9px] text-white/20 italic">No events yet.</p>
                                )}
                                {app.audit_trail?.filter((e: any) => !app.current_state?.run_id || e.run_id === app.current_state.run_id).map((log: any, i: number) => (

                                    <div key={i} className="flex gap-3">
                                        <span className="text-[8px] font-mono text-white/20 shrink-0 pt-0.5">{new Date(log.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}</span>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${log.event_type === 'start' ? 'text-[#0066FF]' : 'text-green-400'}`}>{log.event_type}</span>
                                                <span className="text-[9px] font-bold text-white uppercase">{log.node_name}</span>
                                            </div>
                                            <div className="text-[8px] text-white/30 font-mono truncate">
                                                {log.event_type === 'start' ? JSON.stringify(log.input_summary) : JSON.stringify(log.output_summary)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-5 overflow-y-auto bg-black/20">
                            <h4 className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-3">Live State Inspector</h4>
                            <pre className="text-[9px] font-mono text-[#0066FF]/70 leading-relaxed whitespace-pre-wrap break-all">
                                {JSON.stringify(app.current_state || {}, null, 2)}
                            </pre>
                        </div>
                    </div>
                </section>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
