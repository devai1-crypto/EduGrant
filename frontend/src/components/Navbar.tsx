import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, LogOut } from 'lucide-react';

interface NavbarProps {
  isAdmin?: boolean;
  onLogout?: () => void;
}

export const Navbar = ({ isAdmin, onLogout }: NavbarProps) => {
  const location = useLocation();
  const path = location?.pathname || '';
  const isApplyPage = path.startsWith('/apply') || path.startsWith('/status');
  
  if (isApplyPage) return null;

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-[#001F3F] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <GraduationCap className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tight text-[#001F3F] uppercase">EduGrant <span className="text-[#0066FF]">AI</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
          {isAdmin && (
            <>
              <Link to="/admin" className="hover:text-[#001F3F] transition-colors flex items-center gap-2 font-black cursor-pointer">
                <LayoutDashboard className="w-3 h-3" /> Dashboard
              </Link>
              <button 
                onClick={onLogout}
                className="hover:text-red-500 transition-colors flex items-center gap-2 font-black cursor-pointer uppercase"
              >
                <LogOut className="w-3 h-3" /> Logout
              </button>
            </>
          )}
        </div>
        <Link to="/apply" className="px-6 py-2.5 rounded-full text-xs font-black bg-[#001F3F] text-white shadow-xl hover:bg-[#0066FF] transition-all active:scale-95 uppercase tracking-widest cursor-pointer">
          Apply Now
        </Link>
      </div>
    </nav>
  );
};
