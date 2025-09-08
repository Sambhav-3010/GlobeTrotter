"use client";

import { ro } from "date-fns/locale";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

interface User {
  _id: string;
  email: string;
  f_name?: string;
  l_name?: string;
  username?: string;
  age?: number;
  gender?: string;
  nationality?: string;
  phoneNumber?: string;
  city?: string;
  placesVisited?: string[];
  profilePhoto?: string | null;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter()

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUserState(data);
      } else {
        console.error(
          "Failed to fetch user data with token:",
          response.status,
          await response.json()
        );
        setUserState(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserState(null);
    } finally {
      setLoading(false);
    }
  }, [setUserState, setLoading, process.env.NEXT_PUBLIC_BACKEND_URL]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const setUser = (userData: User | null) => {
    setUserState(userData);
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
