import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Search, ArrowRight } from 'lucide-react';
import { PageWrapper } from '../../components/PageWrapper';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [showTrack, setShowTrack] = useState(false);
  const [appId, setAppId] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (appId.trim()) {
      navigate(`/status/latest?appId=${appId.trim()}`);
    }
  };

  return (
    <PageWrapper>
      <div className="pt-32 pb-24 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0066FF] animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Intelligent Admissions v1.0</span>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-serif text-7xl md:text-8xl leading-[1.05] text-[#001F3F] mb-8">
                Excellence <br /> <span className="italic font-light text-[#0066FF]">Automated.</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg text-gray-500 max-w-lg leading-relaxed mb-12 font-medium opacity-80">
                The world's first multi-agent platform for institutional scholarship evaluation. 
              </motion.p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Link to="/apply" className="inline-flex bg-[#001F3F] text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest items-center gap-3 hover:shadow-2xl hover:bg-black transition-all group cursor-pointer">
                  Begin Application <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </Link>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowTrack(!showTrack)}
                    className="inline-flex items-center gap-3 px-8 py-5 text-[#001F3F] font-black text-sm uppercase tracking-widest hover:text-[#0066FF] transition-colors group cursor-pointer"
                  >
                    <Search className="w-4 h-4" /> Track Status
                  </button>

                  <AnimatePresence>
                    {showTrack && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-50"
                      >
                        <form onSubmit={handleTrack} className="space-y-4">
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Enter Application ID</p>
                          <div className="relative">
                            <input 
                              autoFocus
                              type="text" 
                              placeholder="e.g. 550e8400-e29b..."
                              value={appId}
                              onChange={(e) => setAppId(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#0066FF] transition-all"
                            />
                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#001F3F] text-white rounded-lg flex items-center justify-center hover:bg-[#0066FF] transition-colors">
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5">
               <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-[-40px_40px_80px_rgba(0,0,0,0.08)] border-[8px] border-white">
                <img src="/hero.png" alt="Excellence" className="w-full h-full object-cover scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001F3F]/40 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
