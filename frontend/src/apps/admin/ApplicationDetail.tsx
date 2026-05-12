import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, FileText, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { PageWrapper } from '../../components/PageWrapper';
import { api } from '../../lib/api';

export const ApplicationDetail = () => {
  const { id } = useParams();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
  }, [id]);

  const handleAction = async (decision: 'approved' | 'rejected') => {
    if (!id) return;
    const reason = prompt(`Enter reason for ${decision}:`, `Manual ${decision} by admin`);
    if (reason === null) return;
    
    try {
        await api.overrideDecision(id, { decision, reason });
        const data = await api.getApplicationDetail(id);
        setApp(data);
    } catch (error) {
        alert('Failed to update decision');
    }
  };

  if (loading) return <PageWrapper><div className="pt-32 text-center font-black uppercase text-xs text-gray-400">Loading details...</div></PageWrapper>;
  if (!app) return <PageWrapper><div className="pt-32 text-center font-black uppercase text-xs text-gray-400">Application not found</div></PageWrapper>;

  return (
    <PageWrapper>
      <div className="pt-24 pb-12 px-8">
        <div className="max-w-6xl mx-auto">
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
                    onClick={() => handleAction('rejected')}
                    className="px-8 py-3 bg-white border border-gray-100 text-[#001F3F] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                    Reject
                </button>
                <button 
                    onClick={() => handleAction('approved')}
                    className="px-8 py-3 bg-[#001F3F] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl">
                    Approve
                </button>
            </div>
          </header>

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
                    <div className="grid grid-cols-1 gap-4">
                        {app.attachments?.map((at: any, i: number) => (
                            <div 
                                key={i} 
                                onClick={() => window.open(at.presigned_url, '_blank')}
                                className="flex items-center justify-between p-5 bg-[#FAFAFA] rounded-2xl border border-gray-100 hover:border-[#0066FF] transition-all group cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-300 group-hover:text-[#0066FF] transition-all">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#001F3F]">{at.filename}</span>
                                </div>
                                <CheckCircle2 className="text-green-500 w-4 h-4" />
                            </div>
                        ))}
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
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-8">AI Decision Logic</h3>
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
                            <p className="text-xs leading-relaxed text-white/60">
                                {app.eligibility_result?.reasoning_chain || 'The AI agents are currently evaluating this application based on merit and financial need metrics.'}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Audit Trail */}
                <section className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Audit Trail</h3>
                    <div className="space-y-6">
                        {app.audit_trail?.map((log: any, i: number) => (
                            <div key={i} className="flex gap-4">
                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.event_type === 'error' ? 'bg-red-500' : 'bg-[#0066FF]'}`} />
                                <div>
                                    <span className="block text-[10px] font-bold text-[#001F3F]">
                                        {log.node_name.toUpperCase()} <span className="text-gray-300 font-normal ml-2">[{log.event_type}]</span>
                                    </span>
                                    <span className="block text-[8px] text-gray-400 uppercase mt-1">
                                        {new Date(log.created_at).toLocaleString()}
                                        {log.latency_ms ? ` • ${log.latency_ms}ms` : ''}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {(!app.audit_trail || app.audit_trail.length === 0) && (
                            <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest">No logs yet.</div>
                        )}
                    </div>
                </section>

            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
