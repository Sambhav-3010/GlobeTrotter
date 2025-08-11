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
  setUser: (user: User | null) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserState(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const setUser = (userData: User | null) => {
    setUserState(userData);
    const userSavedData = {
      _id: userData?._id,
      email: userData?.email,
      f_name: userData?.f_name,
      l_name: userData?.l_name,
      username: userData?.username,
    };
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userSavedData));
    } else {
      localStorage.removeItem('user');
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
