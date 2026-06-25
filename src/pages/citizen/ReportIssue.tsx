import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, MapPin, UploadCloud, CheckCircle } from "lucide-react";
import { uploadBytesResumable, getDownloadURL, ref } from "firebase/storage";
import { collection, addDoc, doc, updateDoc, increment } from "firebase/firestore";
import { storage, db } from "../../lib/firebase";
import { useAuthStore } from "../../store/authStore";

export default function ReportIssue() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [step, setStep] = useState(1);

  const handleCaptureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          try {
            const token = import.meta.env.VITE_MAPBOX_TOKEN;
            const res = await fetch(`https://api.mapbox.com/search/geocode/v6/reverse?longitude=${pos.coords.longitude}&latitude=${pos.coords.latitude}&access_token=${token}`);
            const data = await res.json();
            if (data.features && data.features[0]) {
              setAddress(data.features[0].properties.full_address || data.features[0].properties.name);
            }
          } catch (e) {
            console.error(e);
            setAddress("Location captured");
          }
        },
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!file || !location || !user) return;

    setLoading(true);
    try {
      // 1. Upload to Firebase Storage
      const storageRef = ref(storage, `issues/${user.uid}_${Date.now()}_${file.name}`);
      const uploadTask = await uploadBytesResumable(storageRef, file);
      const imageUrl = await getDownloadURL(uploadTask.ref);

      // 2. Call backend AI API
      const aiResponse = await fetch("/api/analyze-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          lat: location.lat,
          lng: location.lng,
          description,
          address
        })
      });
      
      const aiData = await aiResponse.json();
      if (!aiResponse.ok) throw new Error(aiData.error || "Failed to analyze");

      setAiResult(aiData);

      // 3. Save to Firestore
      await addDoc(collection(db, "issues"), {
        reporter_uid: user.uid,
        description,
        image_url: imageUrl,
        location: {
          lat: location.lat,
          lng: location.lng,
          address
        },
        ai_analysis: aiData.category,
        priority: aiData.priority,
        resolution: aiData.resolution,
        vision: aiData.vision,
        status: "open",
        created_at: new Date().toISOString()
      });

      // 4. Award points
      await updateDoc(doc(db, "users", user.uid), {
        total_points: increment(50)
      });
      await updateDoc(doc(db, "rewards", user.uid), {
        total_points: increment(50)
      });

      setStep(2);
    } catch (error) {
      console.error(error);
      alert("Failed to submit issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {step === 1 && (
        <div className="bg-zinc-900 border border-zinc-800/50 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>
          
          <div className="mb-10 relative z-10">
            <span className="inline-block px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 border border-zinc-700/50">Submission</span>
            <h2 className="text-5xl font-bold text-white tracking-tighter leading-[0.9]">REPORT<br/>AN ISSUE</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Evidence Photo</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-zinc-700/50 border-dashed rounded-3xl bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors">
                <div className="space-y-2 text-center">
                  {file ? (
                    <div className="text-sm">
                      <p className="font-mono text-indigo-400">{file.name}</p>
                      <button type="button" onClick={() => setFile(null)} className="mt-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Remove</button>
                    </div>
                  ) : (
                    <>
                      <Camera className="mx-auto h-10 w-10 text-zinc-500 mb-4" />
                      <div className="flex justify-center text-sm">
                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-bold text-white hover:text-indigo-400 transition-colors">
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" accept="image/*" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        </label>
                        <p className="pl-1 text-zinc-500">or drag and drop</p>
                      </div>
                      <p className="text-[10px] font-mono text-zinc-600 mt-2 uppercase">PNG, JPG up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Location</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleCaptureLocation}
                  className="inline-flex items-center justify-center px-6 py-4 border border-zinc-700/50 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors shrink-0"
                >
                  <MapPin className="mr-2 h-4 w-4 text-indigo-400" />
                  Capture GPS
                </button>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Or enter manually..."
                  className="flex-1 block w-full rounded-2xl bg-zinc-800/50 border border-zinc-700/50 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm p-4 placeholder-zinc-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full rounded-2xl bg-zinc-800/50 border border-zinc-700/50 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm p-4 placeholder-zinc-600 transition-colors resize-none"
                placeholder="Briefly describe the issue..."
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !file || !location}
                className={`w-full flex justify-center items-center py-4 px-8 border border-transparent rounded-full shadow-sm text-[10px] font-bold uppercase tracking-widest text-white transition-all ${loading || !file || !location ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border-zinc-700/50' : 'bg-indigo-500 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20'}`}
              >
                {loading ? (
                  <>
                    <UploadCloud className="animate-pulse mr-2 h-4 w-4" />
                    Analyzing with AI...
                  </>
                ) : (
                  "Submit Report"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 2 && aiResult && (
        <div className="bg-zinc-900 border border-zinc-800/50 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>
          
          <div className="text-center mb-10 relative z-10">
            <CheckCircle className="mx-auto h-16 w-16 text-emerald-500 mb-6" />
            <h2 className="text-5xl font-bold text-white tracking-tighter leading-[0.9] mb-4">REPORT<br/>SUBMITTED</h2>
            <p className="text-sm text-zinc-400">You earned <span className="text-emerald-400 font-bold">50 points</span>. Here is what our AI detected:</p>
          </div>

          <div className="bg-[#1A1A1C] border border-zinc-800/50 rounded-[2.5rem] p-8 space-y-8 relative z-10">
            <div>
              <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Detected Category</h3>
              <p className="text-xl font-bold text-white tracking-tight">{aiResult.category.primary_category} <span className="text-zinc-600 font-normal">/</span> {aiResult.category.sub_category}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Priority</h3>
                <p className="text-lg font-bold text-indigo-400 tracking-tight">{aiResult.priority.priority_label}</p>
              </div>
              <div>
                <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Confidence</h3>
                <p className="text-lg font-bold text-emerald-500 tracking-tight">{Math.round(aiResult.vision.confidence_score * 100)}%</p>
              </div>
              <div>
                <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Routed To</h3>
                <p className="text-lg font-bold text-white tracking-tight">{aiResult.category.department_routing}</p>
              </div>
              <div>
                <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Est. Resolution</h3>
                <p className="text-lg font-bold text-white tracking-tight">{aiResult.resolution.estimated_resolution_days} <span className="text-sm font-normal text-zinc-500">days</span></p>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-zinc-800/50">
              <p className="text-sm text-zinc-400 leading-relaxed">"{aiResult.resolution.citizen_friendly_message}"</p>
            </div>
          </div>

          <div className="mt-10 text-center relative z-10">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex justify-center py-4 px-8 border border-zinc-700/50 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
