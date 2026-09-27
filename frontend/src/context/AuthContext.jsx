import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

if (import.meta.env.VITE_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
}
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("expense_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("expense_token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const { data } = await axios.get("/api/user/me");
          setUser(data.user);
          localStorage.setItem("expense_user", JSON.stringify(data.user));
        } catch (err) {
          console.error("Session verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, [token]);

  const login = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem("expense_token", authToken);
    localStorage.setItem("expense_user", JSON.stringify(userData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem("expense_user", JSON.stringify(updatedUserData));
  };

  const logout = async () => {
    try {
      await axios.post("/api/user/logout");
    } catch (err) {
      // Ignore logout errors
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem("expense_token");
      localStorage.removeItem("expense_user");
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
