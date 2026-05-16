import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Activity, ArrowUpRight, BarChart3, PieChart as PieChartIcon, Trash2 } from 'lucide-react';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { PageWrapper } from '../../components/PageWrapper';
import { api } from '../../lib/api';

export const AdminDashboard = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getAdminQueue();
        setApplications(data);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = [
    { name: 'Approved', value: applications.filter(a => a.status === 'approved').length },
    { name: 'Rejected', value: applications.filter(a => a.status === 'rejected').length },
    { name: 'Reviewing', value: applications.filter(a => a.status === 'reviewing' || a.status === 'received').length },
  ];

  const COLORS = ['#0066FF', '#FF4D4D', '#D4A373'];

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this application and all related data? This cannot be undone.')) return;
    try {
      await api.deleteApplication(id);
      setApplications(prev => prev.filter(a => a.application_id !== id));
    } catch (error) {
      console.error('Failed to delete application:', error);
      alert('Delete failed.');
    }
  };


  return (
    <PageWrapper>
      <div className="pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12 flex items-center justify-between">
             <div>
                <h1 className="text-serif text-4xl text-[#001F3F]">Application Queue</h1>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Manage institutional funding requests</p>
             </div>
             <button className="bg-white border border-gray-100 p-2.5 rounded-xl text-[#001F3F] hover:bg-gray-50 transition-all cursor-pointer">
                <Filter className="w-5 h-5" />
             </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm flex flex-col items-center">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 self-start">Status Distribution</h3>
                <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {chartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex gap-4 mt-4">
                    {chartData.map((d, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                            <span className="text-[8px] font-black uppercase text-gray-400">{d.name}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="lg:col-span-2 bg-[#001F3F] rounded-[2.5rem] p-8 text-white shadow-2xl flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">AI Performance Metrics</h3>
                    <BarChart3 className="text-[#0066FF] w-5 h-5" />
                </div>
                <div className="flex-1 flex items-center justify-between">
                    <div className="space-y-2">
                        <span className="text-4xl font-serif text-[#0066FF]">94.2%</span>
                        <span className="block text-[8px] font-black uppercase tracking-widest text-white/40">Extraction Accuracy</span>
                    </div>
                    <div className="w-px h-12 bg-white/10" />
                    <div className="space-y-2">
                        <span className="text-4xl font-serif text-[#0066FF]">18s</span>
                        <span className="block text-[8px] font-black uppercase tracking-widest text-white/40">Avg. Processing Time</span>
                    </div>
                    <div className="w-px h-12 bg-white/10" />
                    <div className="space-y-2">
                        <span className="text-4xl font-serif text-[#0066FF]">82%</span>
                        <span className="block text-[8px] font-black uppercase tracking-widest text-white/40">Auto-Approval Rate</span>
                    </div>
                </div>
            </div>
          </div>
          
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
             {loading ? (
                <div className="p-20 text-center text-gray-400 font-black uppercase tracking-widest text-xs">
                    Loading applications...
                </div>
             ) : (
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-50">
                            {['Student', 'GPA', 'AI Score', 'Status', 'Action'].map(h => (
                                <th key={h} className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {applications.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-12 text-center text-gray-400 text-sm">No applications found.</td>
                            </tr>
                        ) : (
                            applications.map((app, i) => (
                                <tr key={i} className="group border-b border-gray-50 hover:bg-gray-50/50 transition-all">
                                    <td className="px-8 py-6">
                                        <div>
                                            <div className="font-black text-[#001F3F] text-sm">{app.student_email}</div>
                                            <div className="text-[8px] text-gray-400 uppercase tracking-widest mt-0.5">{app.application_id.slice(0, 8)}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-medium text-gray-600">
                                        {app.gpa || '0.00'}
                                    </td>
                                    <td className="px-8 py-6 text-[#0066FF] font-black text-sm">
                                        {app.eligibility_score !== null && app.eligibility_score !== undefined ? app.eligibility_score : '--'}
                                    </td>

                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                            app.status === 'approved' ? 'bg-green-50 text-green-600' : 
                                            app.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                            'bg-orange-50 text-orange-600'
                                        }`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 flex gap-2">
                                        <button 
                                            onClick={() => handleDelete(app.application_id)}
                                            className="p-2.5 bg-red-50 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer inline-flex"
                                            title="Delete Application"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <Link 
                                            to={`/trace/${app.latest_run_id || 'null'}`} 
                                            className="p-2.5 bg-gray-50 rounded-lg text-[#001F3F] hover:bg-[#001F3F] hover:text-white transition-all cursor-pointer inline-flex"
                                            title="View Trace"
                                        >
                                            <Activity className="w-3.5 h-3.5" />
                                        </Link>

                                        <Link 
                                            to={`/admin/applications/${app.application_id}`} 
                                            className="p-2.5 bg-gray-50 rounded-lg text-[#001F3F] hover:bg-[#0066FF] hover:text-white transition-all cursor-pointer inline-flex"
                                            title="View Details"
                                        >
                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
             )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
