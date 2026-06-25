import { create } from "zustand";
import { User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider, db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface AuthState {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userProfile: null,
  loading: true,
  login: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      let profile = userSnap.data();

      if (!userSnap.exists()) {
        profile = {
          uid: user.uid,
          display_name: user.displayName,
          email: user.email,
          photo_url: user.photoURL,
          role: "citizen",
          trust_score: 50,
          total_points: 0,
          created_at: new Date().toISOString(),
        };
        await setDoc(userRef, profile);
        
        // Init rewards doc
        await setDoc(doc(db, "rewards", user.uid), {
          uid: user.uid,
          total_points: 0,
          level_number: 1,
          level_title: "Civic Newcomer",
          badges: []
        });
      }
      set({ user, userProfile: profile, loading: false });
    } catch (error) {
      console.error("Login failed:", error);
      set({ loading: false });
    }
  },
  logout: async () => {
    await signOut(auth);
    set({ user: null, userProfile: null });
  },
  initialize: () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        set({ user, userProfile: userSnap.data() || null, loading: false });
      } else {
        set({ user: null, userProfile: null, loading: false });
      }
    });
  }
}));
