import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Fingerprint, Award, Wallet, 
  Zap, Upload, CheckCircle2, User, Banknote, FileText, 
  Plus, Sparkles, RotateCcw, ArrowRight, Loader2, Calendar, ShieldCheck
} from 'lucide-react';
import { PageWrapper } from '../../components/PageWrapper';
import { api } from '../../lib/api';

export const StudentPortal = () => {
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

  const handleFinalSubmit = async () => {
    if (step !== 5) return;
    setIsSubmitting(true);
    
    try {
      // In a real app, we would upload files to S3/R2 first and get keys
      // For this MVP, we'll simulate the S3 keys
      const attachments = Object.entries(files)
        .filter(([_, file]) => file !== null)
        .map(([id, file]) => `uploads/${id}_${file?.name}`);

      const response = await api.submitApplication({
        scholarship_type: 'merit_undergrad',
        form_data: formData,
        attachments: attachments
      });

      // Redirect to status page with the new run_id
      navigate(`/status/${response.run_id}?appId=${response.application_id}`);
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            <Link to="/" className="flex items-center gap-2 text-gray-400 font-black hover:text-[#001F3F] transition-colors text-[10px] uppercase tracking-[0.3em] cursor-pointer group">
              <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Back to Home
            </Link>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className={`w-8 h-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#001F3F]' : 'bg-gray-200'}`} />
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
                      <div className="flex items-center gap-3 text-[#0066FF] mb-3">
                         <Fingerprint className="w-5 h-5" />
                         <span className="text-[9px] font-black uppercase tracking-[0.4em]">Section 01</span>
                      </div>
                      <h2 className="text-serif text-5xl text-[#001F3F]">Identity</h2>
                    </header>

                    <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-8">
                        <div className="col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5 block">Legal Full Name</label>
                          <input type="text" required className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm font-medium focus:border-[#001F3F] outline-none transition-all" placeholder="Alexander Hamilton" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5 block">Email Address</label>
                          <input type="email" required className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm font-medium focus:border-[#001F3F] outline-none" placeholder="name@edu.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5 block">Date of Birth</label>
                          <div className="relative">
                            <input type="date" required className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm font-medium focus:border-[#001F3F] outline-none cursor-pointer" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5 block">Nationality</label>
                          <input type="text" required className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm font-medium focus:border-[#001F3F] outline-none" placeholder="United States" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5 block">Student ID (Optional)</label>
                          <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm font-medium focus:border-[#001F3F] outline-none" placeholder="SID-88291" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                    <header>
                      <div className="flex items-center gap-3 text-[#0066FF] mb-3">
                         <Award className="w-5 h-5" />
                         <span className="text-[9px] font-black uppercase tracking-[0.4em]">Section 02</span>
                      </div>
                      <h2 className="text-serif text-5xl text-[#001F3F]">Academic</h2>
                    </header>

                    <div className="space-y-8">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5 block">Institution</label>
                        <input type="text" required className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm font-medium focus:border-[#001F3F] outline-none" placeholder="Stanford University" value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5 block">Cumulative GPA</label>
                          <input type="number" required step="0.01" className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm font-medium focus:border-[#001F3F] outline-none" placeholder="4.00" value={formData.gpa} onChange={e => setFormData({...formData, gpa: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5 block">Credits Completed</label>
                          <input type="number" required className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm font-medium focus:border-[#001F3F] outline-none" placeholder="60" value={formData.credits} onChange={e => setFormData({...formData, credits: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                    <header>
                      <div className="flex items-center gap-3 text-[#0066FF] mb-3">
                         <Wallet className="w-5 h-5" />
                         <span className="text-[9px] font-black uppercase tracking-[0.4em]">Section 03</span>
                      </div>
                      <h2 className="text-serif text-5xl text-[#001F3F]">Financial</h2>
                    </header>

                    <div className="space-y-8">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5 block">Annual Household Income (USD)</label>
                        <div className="relative">
                          <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <input type="number" required className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-5 py-3.5 text-sm font-medium focus:border-[#001F3F] outline-none" placeholder="0.00" value={formData.income} onChange={e => setFormData({...formData, income: e.target.value})} />
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
                      <div className="flex items-center gap-3 text-[#0066FF] mb-3">
                         <Zap className="w-5 h-5" />
                         <span className="text-[9px] font-black uppercase tracking-[0.4em]">Section 04</span>
                      </div>
                      <h2 className="text-serif text-5xl text-[#001F3F]">The Vault</h2>
                    </header>

                    <div className="space-y-6">
                       <div className="p-10 border-2 border-dashed border-gray-100 rounded-[2rem] bg-[#FAFAFA] text-center group hover:border-[#001F3F] transition-all cursor-pointer relative">
                        <Upload className="w-10 h-10 text-gray-300 mb-4 mx-auto group-hover:text-[#001F3F] transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[#001F3F] block">Click to upload official transcript</span>
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
                          <div key={doc.id} className="relative flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-[#001F3F] transition-all shadow-sm group cursor-pointer overflow-hidden">
                             <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-[#FAFAFA] rounded-xl flex items-center justify-center text-gray-300 group-hover:text-[#001F3F] transition-colors">
                                 <doc.icon className="w-5 h-5" />
                               </div>
                               <div>
                                 <h4 className="text-[10px] font-black uppercase tracking-widest text-[#001F3F]">{doc.label}</h4>
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
                      <div className="flex items-center gap-3 text-[#0066FF] mb-3">
                         <Sparkles className="w-5 h-5" />
                         <span className="text-[9px] font-black uppercase tracking-[0.4em]">Section 05</span>
                      </div>
                      <h2 className="text-serif text-5xl text-[#001F3F]">Review</h2>
                    </header>

                    <div className="space-y-6">
                       {[
                         { id: 1, label: 'Identity', data: [ { l: 'Name', v: formData.fullName }, { l: 'Email', v: formData.email }, { l: 'Nationality', v: formData.nationality }, { l: 'Student ID', v: formData.studentId } ] },
                         { id: 2, label: 'Academic', data: [ { l: 'Institution', v: formData.institution }, { l: 'GPA', v: formData.gpa } ] },
                         { id: 3, label: 'Financial', data: [ { l: 'Annual Income', v: `$${formData.income}` } ] }
                       ].map(section => (
                         <div key={section.id} className="p-8 bg-[#FAFAFA] rounded-3xl border border-gray-100 group relative hover:border-[#001F3F] transition-all">
                            <button type="button" onClick={() => setStep(section.id)} className="absolute top-6 right-6 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-[#001F3F] transition-colors">
                              <RotateCcw className="w-3 h-3" /> Edit Section
                            </button>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">{section.label}</h3>
                            <div className="grid grid-cols-2 gap-8">
                               {section.data.map((d, i) => (
                                 <div key={i}>
                                    <span className="block text-[8px] font-black uppercase text-gray-400 mb-1">{d.l}</span>
                                    <span className="text-sm font-medium text-[#001F3F]">{d.v || 'Not provided'}</span>
                                 </div>
                               ))}
                            </div>
                         </div>
                       ))}

                       <div className="p-8 bg-[#FAFAFA] rounded-3xl border border-gray-100 group relative hover:border-[#001F3F] transition-all">
                          <button type="button" onClick={() => setStep(4)} className="absolute top-6 right-6 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-[#001F3F] transition-colors">
                            <RotateCcw className="w-3 h-3" /> Edit Section
                          </button>
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Documents</h3>
                          <div className="flex flex-wrap gap-2">
                             {Object.entries(files).map(([id, file]) => (
                               file && <div key={id} className="px-4 py-2 bg-white rounded-xl border border-gray-100 text-[9px] font-black uppercase tracking-widest text-[#001F3F] flex items-center gap-2">
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
                  <button type="button" className="px-6 py-3 bg-[#F1F3F5] text-[#001F3F] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all cursor-pointer">Draft</button>
                  <button type="button" className="px-6 py-3 bg-[#E9ECEF] text-[#001F3F] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all cursor-pointer">Restore</button>
                </div>
                
                <div className="flex gap-4 items-center">
                   {step > 1 && (
                     <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 bg-[#F1F3F5] text-[#001F3F] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all cursor-pointer flex items-center gap-2">
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
                      className="px-10 py-3 bg-[#001F3F] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl cursor-pointer flex items-center gap-3"
                    >
                      {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Sparkles className="w-3.5 h-3.5 text-[#0066FF]" /> Create Application</>}
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
