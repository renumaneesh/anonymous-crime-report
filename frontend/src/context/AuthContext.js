import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("crToken");
    const savedUser = localStorage.getItem("crUser");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Optionally verify token
      authAPI.verify().catch(() => logout());
    }
    setLoading(false);
  }, []);

  const login = (token, official) => {
    localStorage.setItem("crToken", token);
    localStorage.setItem("crUser", JSON.stringify(official));
    setUser(official);
  };

  const logout = () => {
    localStorage.removeItem("crToken");
    localStorage.removeItem("crUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
