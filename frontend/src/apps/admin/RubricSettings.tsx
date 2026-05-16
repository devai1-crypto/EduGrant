import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Trash2, CheckCircle2, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
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
            setMessage({ type: 'success', text: 'Intelligence rules updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save configuration.' });
        } finally {
            setSaving(false);
        }
    };

    const addCriterion = () => {
        const newCriterion = {
            name: "New Criterion",
            weight: 0.1,
            rubric: { "Standard": 100 }
        };
        setRubric({ ...rubric, criteria: [...rubric.criteria, newCriterion] });
    };

    const removeCriterion = (index: number) => {
        const newCriteria = rubric.criteria.filter((_: any, i: number) => i !== index);
        setRubric({ ...rubric, criteria: newCriteria });
    };

    const addRange = (cIndex: number) => {
        const newCriteria = [...rubric.criteria];
        newCriteria[cIndex].rubric["New Range"] = 0;
        setRubric({ ...rubric, criteria: newCriteria });
    };

    const removeRange = (cIndex: number, key: string) => {
        const newCriteria = [...rubric.criteria];
        delete newCriteria[cIndex].rubric[key];
        setRubric({ ...rubric, criteria: newCriteria });
    };

    const updateRangeKey = (cIndex: number, oldKey: string, newKey: string) => {
        const newCriteria = [...rubric.criteria];
        const val = newCriteria[cIndex].rubric[oldKey];
        delete newCriteria[cIndex].rubric[oldKey];
        newCriteria[cIndex].rubric[newKey] = val;
        setRubric({ ...rubric, criteria: newCriteria });
    };

    const updateRangeValue = (cIndex: number, key: string, value: number) => {
        const newCriteria = [...rubric.criteria];
        newCriteria[cIndex].rubric[key] = value;
        setRubric({ ...rubric, criteria: newCriteria });
    };

    if (loading) return <div className="p-20 text-center font-black uppercase tracking-widest text-gray-400">Syncing Intelligence...</div>;

    const totalWeight = rubric.criteria.reduce((acc: number, c: any) => acc + (c.weight || 0), 0);

    return (
        <PageWrapper>
            <div className="pt-24 pb-20 px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h1 className="text-serif text-5xl text-[#001F3F]">Scoring Engine</h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2">No-Code AI Configuration Portal</p>
                        </div>
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-[#0066FF] text-white px-10 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:bg-[#001F3F] transition-all shadow-xl shadow-[#0066FF]/20 disabled:opacity-50"
                        >
                            {saving ? 'Syncing...' : <><Save className="w-4 h-4" /> Deploy Rules</>}
                        </button>
                    </div>

                    <AnimatePresence>
                        {message && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`p-6 rounded-[2rem] mb-12 flex items-center gap-4 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                            >
                                {message.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                <span className="font-bold text-sm">{message.text}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Basic Info */}
                    <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-sm mb-12">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1.5 h-6 bg-[#0066FF] rounded-full" />
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#001F3F]">Program Identity</h3>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 block">Scholarship Program Name</label>
                            <input 
                                type="text" 
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-[#001F3F] focus:border-[#0066FF] focus:bg-white outline-none transition-all"
                                value={rubric.name}
                                onChange={e => setRubric({...rubric, name: e.target.value})}
                                placeholder="e.g. Merit-Based Undergraduate"
                            />
                        </div>
                    </div>

                    {/* Criteria Section */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-[#0066FF] rounded-full" />
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#001F3F]">Evaluation Rules</h3>
                            </div>
                            <div className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full ${Math.abs(totalWeight - 1) < 0.01 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                Total Weight: {(totalWeight * 100).toFixed(0)}% {Math.abs(totalWeight - 1) > 0.01 && ' (Must equal 100%)'}
                            </div>
                        </div>

                        {rubric.criteria.map((c: any, cIdx: number) => (
                            <motion.div 
                                layout
                                key={cIdx}
                                className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="p-8 border-b border-gray-50 bg-[#FAFAFA]/50 flex items-center justify-between">
                                    <div className="flex-1 grid grid-cols-2 gap-8">
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Criterion</label>
                                            <input 
                                                type="text" 
                                                className="bg-transparent text-lg font-serif text-[#001F3F] outline-none border-b border-transparent focus:border-[#0066FF] w-full"
                                                value={c.name}
                                                onChange={e => {
                                                    const next = [...rubric.criteria];
                                                    next[cIdx].name = e.target.value;
                                                    setRubric({...rubric, criteria: next});
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Importance (0 - 100%)</label>
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="range"
                                                    min="0" max="1" step="0.05"
                                                    className="flex-1 accent-[#0066FF]"
                                                    value={c.weight}
                                                    onChange={e => {
                                                        const next = [...rubric.criteria];
                                                        next[cIdx].weight = parseFloat(e.target.value);
                                                        setRubric({...rubric, criteria: next});
                                                    }}
                                                />
                                                <span className="text-sm font-black text-[#0066FF] w-12 text-right">{(c.weight * 100).toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => removeCriterion(cIdx)}
                                        className="ml-8 p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-10">
                                    <div className="mb-6 flex items-center justify-between">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Scoring Thresholds</h4>
                                        <button 
                                            onClick={() => addRange(cIdx)}
                                            className="text-[10px] font-black uppercase tracking-widest text-[#0066FF] flex items-center gap-2 hover:opacity-70"
                                        >
                                            <Plus className="w-3 h-3" /> Add Tier
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {Object.entries(c.rubric).map(([key, val]: [string, any], rIdx) => (
                                            <div key={rIdx} className="grid grid-cols-12 gap-4 items-center">
                                                <div className="col-span-7">
                                                    <input 
                                                        type="text" 
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-gray-600 outline-none focus:bg-white focus:border-[#0066FF]"
                                                        value={key}
                                                        onChange={e => updateRangeKey(cIdx, key, e.target.value)}
                                                        placeholder="Range (e.g. 3.8 - 4.0)"
                                                    />
                                                </div>
                                                <div className="col-span-3">
                                                    <div className="relative">
                                                        <input 
                                                            type="number" 
                                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-4 pr-10 py-3 text-xs font-black text-[#0066FF] outline-none focus:bg-white focus:border-[#0066FF]"
                                                            value={val}
                                                            onChange={e => updateRangeValue(cIdx, key, parseInt(e.target.value))}
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-300 uppercase">Pts</span>
                                                    </div>
                                                </div>
                                                <div className="col-span-2 flex justify-end">
                                                    <button 
                                                        onClick={() => removeRange(cIdx, key)}
                                                        className="p-2 text-gray-200 hover:text-red-400 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        <button 
                            onClick={addCriterion}
                            className="w-full py-8 border-2 border-dashed border-gray-200 rounded-[3rem] text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 hover:border-[#0066FF] hover:text-[#0066FF] hover:bg-[#0066FF]/5 transition-all flex items-center justify-center gap-3"
                        >
                            <Plus className="w-5 h-5" /> Add New Criterion
                        </button>
                    </div>

                    <div className="mt-20 p-10 bg-[#001F3F] rounded-[3rem] text-white flex items-center gap-8">
                        <div className="w-16 h-16 bg-[#0066FF] rounded-[1.5rem] flex items-center justify-center shrink-0">
                            <Info className="w-8 h-8" />
                        </div>
                        <div>
                            <h4 className="font-serif text-2xl mb-1">How this works</h4>
                            <p className="text-xs text-white/50 leading-relaxed">
                                Our AI uses these weights to prioritize applications. A criterion with 60% weight matters 3x more than one with 20%. The "Ranges" tell the AI exactly how many points to award based on document evidence.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};
