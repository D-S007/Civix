import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { LogOut, MapPin, PlusCircle, User } from "lucide-react";

export default function Navbar() {
  const { user, logout, userProfile } = useAuthStore();

  return (
    <header className="bg-[#0A0A0B] border-b border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <span className="text-white font-bold tracking-tight block leading-none">CIVIC.SENSE</span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Platform v1.0</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  to="/report"
                  className="inline-flex items-center px-6 py-2 bg-indigo-500 border border-indigo-500/20 rounded-full text-[10px] font-bold text-white uppercase tracking-widest hover:bg-indigo-600 transition-colors"
                >
                  <PlusCircle className="mr-2 -ml-1 h-4 w-4" aria-hidden="true" />
                  Report Issue
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">{user.displayName}</span>
                    <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">{userProfile?.total_points || 0} pts</span>
                  </div>
                  {user.photoURL ? (
                    <img className="h-8 w-8 rounded-full" src={user.photoURL} alt="" />
                  ) : (
                    <User className="h-8 w-8 text-gray-400 bg-gray-100 rounded-full p-1" />
                  )}
                  <button onClick={logout} className="ml-2 text-zinc-500 hover:text-white transition-colors">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-2 bg-zinc-800 border border-zinc-700/50 rounded-full text-[10px] font-bold text-zinc-300 uppercase tracking-widest hover:bg-zinc-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
