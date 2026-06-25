import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import ReportIssue from "./pages/citizen/ReportIssue";
import Navbar from "./components/common/Navbar";

export default function App() {
  const { initialize, loading, user } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-400 font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <CitizenDashboard /> : <Navigate to="/login" />} />
          <Route path="/report" element={user ? <ReportIssue /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
}
