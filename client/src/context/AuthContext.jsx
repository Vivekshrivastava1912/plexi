import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser =
      localStorage.getItem("user") || localStorage.getItem("support_ticket_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("support_ticket_token") ||
      null
    );
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedToken =
        localStorage.getItem("token") ||
        localStorage.getItem("support_ticket_token");
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.success && (res.data || res.user)) {
            const userData = res.data || res.user;
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
          }
        } catch (err) {
          localStorage.removeItem("token");
          localStorage.removeItem("support_ticket_token");
          localStorage.removeItem("user");
          localStorage.removeItem("support_ticket_user");
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await authAPI.login({ email, password });
      if (res.success && res.token) {
        const userData = res.data || res.user;
        localStorage.setItem("token", res.token);
        localStorage.setItem("support_ticket_token", res.token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("support_ticket_user", JSON.stringify(userData));
        setToken(res.token);
        setUser(userData);
        return { success: true };
      } else {
        throw new Error(res.message || "Login failed");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Failed to authenticate";
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const res = await authAPI.register({ name, email, password });
      if (res.success && res.token) {
        const userData = res.data || res.user;
        localStorage.setItem("token", res.token);
        localStorage.setItem("support_ticket_token", res.token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("support_ticket_user", JSON.stringify(userData));
        setToken(res.token);
        setUser(userData);
        return { success: true };
      } else {
        throw new Error(res.message || "Registration failed");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Failed to register";
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("support_ticket_token");
    localStorage.removeItem("user");
    localStorage.removeItem("support_ticket_user");
    setUser(null);
    setToken(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
