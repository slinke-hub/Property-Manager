import { useState, useEffect } from "react";
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth, db } from "@/config/firebase";
import { doc, setDoc } from "firebase/firestore";

// Extend Firebase User to include `id` for compatibility with existing Supabase code
export interface AppUser extends FirebaseUser {
  id: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Map uid to id to prevent breaking existing Supabase code that expects user.id
        const mappedUser = currentUser as any;
        if (!mappedUser.id) mappedUser.id = mappedUser.uid;
        setUser(mappedUser as AppUser);
        setSession({ user: mappedUser });
      } else {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Store additional user data and roles in Firestore users collection
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email,
        full_name: fullName,
        role: role,
        created_at: new Date().toISOString()
      });
      return { error: null };
    } catch (error: any) {
      // Return error object with message property as expected by Auth component
      return { error: { message: error.message } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      return { error: { message: "Invalid email or password" } };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };
};