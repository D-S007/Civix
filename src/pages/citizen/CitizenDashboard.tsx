import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuthStore } from "../../store/authStore";
import IssueMap from "../../components/map/IssueMap";
import { Link } from "react-router-dom";
import { PlusCircle, Award, CheckCircle } from "lucide-react";

export default function CitizenDashboard() {
  const { userProfile } = useAuthStore();
  const [recentIssues, setRecentIssues] = useState<any[]>([]);

  useEffect(() => {
    const fetchIssues = async () => {
      const q = query(collection(db, "issues"), orderBy("created_at", "desc"), limit(10));
      const snap = await getDocs(q);
      setRecentIssues(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchIssues();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 border border-zinc-700/50">Active Session</span>
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tighter leading-[0.9]">
            HELLO,<br/>{userProfile?.display_name?.split(' ')[0]?.toUpperCase() || 'CITIZEN'}
          </h1>
        </div>
        <div>
          <Link
            to="/report"
            className="inline-flex items-center px-6 py-3 bg-indigo-500 rounded-full text-[10px] font-bold text-white uppercase tracking-widest hover:bg-indigo-600 transition-colors"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Report Issue
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 mb-5">
        <div className="bg-[#1A1A1C] border border-zinc-800/50 rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/10 blur-[60px] pointer-events-none"></div>
          <span className="text-xs font-mono uppercase tracking-[0.15em] text-zinc-500 relative z-10">Total Points</span>
          <div className="text-5xl font-bold text-white tracking-tighter mt-4 relative z-10">{userProfile?.total_points || 0}</div>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800/50 rounded-[2.5rem] p-8 flex flex-col justify-between">
          <span className="text-xs font-mono uppercase tracking-[0.15em] text-zinc-500">Reports Submitted</span>
          <div className="text-5xl font-bold text-white tracking-tighter mt-4">0</div>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800/50 rounded-[2.5rem] p-8 flex flex-col justify-between">
          <span className="text-xs font-mono uppercase tracking-[0.15em] text-zinc-500">Reports Verified</span>
          <div className="text-5xl font-bold text-white tracking-tighter mt-4">0</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800/50 rounded-[2.5rem] p-8 flex flex-col">
          <span className="text-xs font-mono uppercase tracking-[0.15em] text-zinc-500 mb-6">Live Community Map</span>
          <div className="flex-1 min-h-[400px]">
            <IssueMap issues={recentIssues} />
          </div>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800/50 rounded-[2.5rem] p-8 flex flex-col">
          <span className="text-xs font-mono uppercase tracking-[0.15em] text-zinc-500 mb-6">Recent Reports</span>
          <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4 max-h-[400px] scrollbar-thin scrollbar-thumb-zinc-800">
            {recentIssues.length === 0 ? (
              <div className="text-center text-sm text-zinc-500 font-mono mt-10">No recent issues found.</div>
            ) : (
              recentIssues.map(issue => (
                <div key={issue.id} className="p-4 bg-zinc-800/30 border border-zinc-800 rounded-2xl hover:bg-zinc-800/50 transition-colors">
                  <div className="flex space-x-4">
                    {issue.image_url && (
                      <img src={issue.image_url} alt="issue" className="h-12 w-12 rounded-xl object-cover" />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white tracking-tight">{issue.ai_analysis?.sub_category || 'Issue'}</h3>
                        <span className={`px-2 py-1 inline-flex text-[10px] font-bold uppercase tracking-widest rounded-md ${
                          issue.status === 'open' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {issue.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 truncate">{issue.description}</p>
                      <p className="text-[10px] font-mono text-zinc-600 truncate">{issue.location?.address}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
