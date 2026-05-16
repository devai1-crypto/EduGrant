import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { PageWrapper } from '../../components/PageWrapper';

interface AdminLoginProps {
  onLogin: (password: string) => void;
}

export const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [instituteId, setInstituteId] = useState('stanford');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Send the combined credentials
    const credentials = `${instituteId}:${password}`;
    
    setTimeout(async () => {
        try {
            await onLogin(credentials);
        } catch (err) {
            setError(true);
            // Shake animation reset
            setTimeout(() => setError(false), 500);
        } finally {
            setLoading(false);
        }
    }, 800);
  };

  return (
    <PageWrapper bg="bg-[#001F3F]">
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-[#0066FF] rounded-[2rem] flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-[#0066FF]/20">
              <ShieldCheck className="text-white w-10 h-10" />
            </div>
            <h1 className="text-serif text-4xl text-white mb-2">Restricted Access</h1>
            <p className="text-[10px] font-black text-[#0066FF] uppercase tracking-[0.4em]">Institutional Intelligence Portal</p>
          </div>

          <motion.div 
            animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
            className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-10 shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-3 block">Target Institution</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:border-[#0066FF] outline-none transition-all"
                    value={instituteId}
                    onChange={(e) => setInstituteId(e.target.value)}
                  >
                    <option value="stanford">Stanford University</option>
                    <option value="harvard">Harvard University</option>
                    <option value="mit">MIT</option>
                    <option value="edugrant">EduGrant Global</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-3 block">Security Credentials</label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input 
                      type="password" 
                      required
                      placeholder="Enter Access Key"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white text-sm focus:border-[#0066FF] outline-none transition-all placeholder:text-white/10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#0066FF] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white hover:text-[#001F3F] transition-all group"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>Verify Identity <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>
          </motion.div>
          
          <p className="text-center mt-12 text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">
            Authorized Personnel Only • Audit Log Active
          </p>
        </motion.div>
      </div>
    </PageWrapper>
  );
};
