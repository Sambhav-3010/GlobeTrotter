"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface User {
  _id: string;
  email: string;
  f_name?: string;
  l_name?: string;
  username?: string;
  age?: number;
  gender?: string;
  nationality?: string;
  mobile?: string;
  city?: string;
  placesVisited?: string[];
  profilePhoto?: string | null;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void; // This will trigger a re-fetch of user data
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Helper to get cookie value
const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserState(data.user);
      } else {
        console.error("Failed to fetch user data with token:", response.status, await response.json());
        setUserState(null);
        // Clear invalid token
        if (typeof document !== 'undefined') {
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserState(null);
      // Clear token on network error
      if (typeof document !== 'undefined') {
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getCookie('token');
    if (token) {
      fetchUserData(token);
    } else {
      setUserState(null);
      setLoading(false);
    }
  }, []);

  const setUser = (userData: User | null) => {
    setUserState(userData); // Update local state directly
    if (!userData) {
      // Clear token cookie if user data is set to null (e.g., logout)
      if (typeof document !== 'undefined') {
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      }
    }
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
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
