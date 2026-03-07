import { useState, useEffect } from "react";
import { db } from "@/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { AppUser } from "@/hooks/useAuth";

export type UserRole = "admin" | "user" | "owner" | "property_manager" | null;

export const useUserRole = (user: AppUser | null) => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      if (user.email === 'privatepple@gmail.com') {
        setRole('admin');
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, "users", user.id);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setRole((data.role as UserRole) ?? "user");
        } else {
          setRole("user");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole("user");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return { role, loading };
};