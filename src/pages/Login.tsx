import { useAuthStore } from "../store/authStore";
import { MapPin } from "lucide-react";

export default function Login() {
  const { login } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <MapPin className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-8 text-center text-5xl font-bold text-white tracking-tighter leading-[0.9]">
          ACCESS<br/>NODE
        </h2>
        <p className="mt-4 text-center text-sm text-zinc-400 font-mono uppercase tracking-[0.1em]">
          Join your community network
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-zinc-900 border border-zinc-800/50 py-10 px-6 sm:rounded-[2.5rem] sm:px-12 text-center">
          <span className="inline-block px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-8 border border-zinc-700/50">Authentication</span>
          <button
            onClick={login}
            className="w-full flex items-center justify-center px-8 py-4 bg-white rounded-full text-[10px] font-bold text-black uppercase tracking-widest hover:bg-zinc-200 transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
