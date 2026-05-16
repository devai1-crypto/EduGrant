import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Settings, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { PageWrapper } from '../../components/PageWrapper';
import { api } from '../../lib/api';

export const RubricSettings = () => {
    const [rubric, setRubric] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchRubric = async () => {
            try {
                const data = await api.getRubric();
                setRubric(data);
            } catch (error) {
                console.error('Failed to fetch rubric:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRubric();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await api.updateRubric(rubric);
            setMessage({ type: 'success', text: 'Scoring criteria updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update criteria.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center font-black uppercase tracking-widest text-gray-400">Loading Intelligence Configuration...</div>;

    return (
        <PageWrapper>
            <div className="pt-24 pb-12 px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h1 className="text-serif text-4xl text-[#001F3F]">Intelligence Criteria</h1>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Configure how the AI evaluates applications</p>
                        </div>
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-[#0066FF] text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-[#001F3F] transition-all disabled:opacity-50"
                        >
                            {saving ? 'Processing...' : <><Save className="w-4 h-4" /> Save Configuration</>}
                        </button>
                    </div>

                    {message && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-2xl mb-8 flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}
                        >
                            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <span className="text-xs font-bold uppercase tracking-wider">{message.text}</span>
                        </motion.div>
                    )}

                    <div className="space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0066FF] mb-6">Program Identity</h3>
                            <div>
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Scholarship Name</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-medium focus:border-[#0066FF] outline-none"
                                    value={rubric.name}
                                    onChange={e => setRubric({...rubric, name: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0066FF]">Weighted Criteria</h3>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">Total Weight: {rubric.criteria.reduce((acc: number, c: any) => acc + c.weight, 0).toFixed(1)}</div>
                            </div>
                            
                            <div className="space-y-6">
                                {rubric.criteria.map((c: any, i: number) => (
                                    <div key={i} className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                        <div className="grid grid-cols-3 gap-6">
                                            <div className="col-span-2">
                                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Criterion Name</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-[#001F3F] outline-none"
                                                    value={c.name}
                                                    onChange={e => {
                                                        const newCriteria = [...rubric.criteria];
                                                        newCriteria[i].name = e.target.value;
                                                        setRubric({...rubric, criteria: newCriteria});
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Weight (0.0 - 1.0)</label>
                                                <input 
                                                    type="number" 
                                                    step="0.1"
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-[#001F3F] outline-none"
                                                    value={c.weight}
                                                    onChange={e => {
                                                        const newCriteria = [...rubric.criteria];
                                                        newCriteria[i].weight = parseFloat(e.target.value);
                                                        setRubric({...rubric, criteria: newCriteria});
                                                    }}
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Scoring Logic (JSON Prompt)</label>
                                                <textarea 
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[10px] font-mono text-gray-600 outline-none min-h-[100px]"
                                                    value={JSON.stringify(c.rubric, null, 2)}
                                                    onChange={e => {
                                                        try {
                                                            const parsed = JSON.parse(e.target.value);
                                                            const newCriteria = [...rubric.criteria];
                                                            newCriteria[i].rubric = parsed;
                                                            setRubric({...rubric, criteria: newCriteria});
                                                        } catch (err) {
                                                            // Keep as is while typing
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 bg-[#001F3F] rounded-[2.5rem] text-white flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#0066FF] rounded-2xl">
                                    <Settings className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-serif text-xl">Advanced Override</h4>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Manual JSON Configuration</p>
                                </div>
                            </div>
                            <button className="px-6 py-3 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                                Open Expert Editor
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};
