import { Link } from "react-router-dom";
import { ArrowRight, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";

export default function Landing() {
  return (
    <div className="bg-[#0A0A0B] min-h-screen relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
        <div className="text-center flex flex-col items-center">
          <span className="inline-block px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-8 border border-zinc-700/50">Civic Intelligence Platform</span>
          <h1 className="text-6xl tracking-tighter font-bold text-white sm:text-7xl md:text-8xl leading-[0.9]">
            SEE IT. <br className="hidden sm:block" />
            <span className="text-indigo-500">FIX IT.</span>
          </h1>
          <p className="mt-8 max-w-md mx-auto text-lg text-zinc-400 sm:text-xl md:max-w-2xl leading-relaxed">
            Empowering citizens to report community issues instantly. Our AI prioritizes reports for city officials, getting your neighborhood fixed faster.
          </p>
          <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center gap-4">
            <Link
              to="/report"
              className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-indigo-500 rounded-full text-[10px] font-bold text-white uppercase tracking-widest hover:bg-indigo-600 transition-colors"
            >
              Report an Issue <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              to="/dashboard"
              className="mt-3 sm:mt-0 w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-zinc-800 border border-zinc-700/50 rounded-full text-[10px] font-bold text-zinc-300 uppercase tracking-widest hover:bg-zinc-700 transition-colors"
            >
              View Dashboard
            </Link>
          </div>
        </div>
        
        <div className="mt-32">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-zinc-900 border border-zinc-800/50 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[40px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>
              <span className="text-xs font-mono uppercase tracking-[0.15em] text-zinc-500 mb-6">01</span>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white tracking-tighter mb-4">Report<br/>Instantly</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Take a photo, and our AI automatically detects the problem and location. Potholes, broken lights, or water leaks.
                </p>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800/50 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>
              <span className="text-xs font-mono uppercase tracking-[0.15em] text-zinc-500 mb-6">02</span>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white tracking-tighter mb-4">Community<br/>Verified</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Earn trust and rewards by verifying issues reported by others in your community.
                </p>
              </div>
            </div>

            <div className="bg-[#1A1A1C] border border-zinc-800/50 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[40px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>
              <span className="text-xs font-mono uppercase tracking-[0.15em] text-zinc-500 mb-6">03</span>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white tracking-tighter mb-4">Smart<br/>Resolution</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  City officials get a prioritized queue, helping them address critical issues faster with predictive analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
