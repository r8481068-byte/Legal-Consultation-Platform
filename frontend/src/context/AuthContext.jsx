
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { logoutUser as logoutUserApi } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem("user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      sessionStorage.removeItem("user");
      return null;
    }
  });

  const login = useCallback((result) => {
    sessionStorage.setItem("accessToken", result.accessToken);
    sessionStorage.setItem("refreshToken", result.refreshToken);
    sessionStorage.setItem("user", JSON.stringify(result.user));

    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = sessionStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await logoutUserApi(refreshToken);
      }
    } catch (error) {
      console.error("Backend logout failed:", error.message);
    } finally {
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("user");
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((partialUser) => {
    if (!partialUser || typeof partialUser !== "object") return;

    setUser((prev) => {
      if (!prev) {
        sessionStorage.setItem("user", JSON.stringify(partialUser));
        return partialUser;
      }

      // Check if any value actually changed to prevent render loops
      let hasChanges = false;
      for (const [key, value] of Object.entries(partialUser)) {
        if (prev[key] !== value) {
          hasChanges = true;
          break;
        }
      }

      if (!hasChanges) {
        return prev;
      }

      const merged = { ...prev, ...partialUser };
      sessionStorage.setItem("user", JSON.stringify(merged));
      return merged;
    });
  }, []);

  const contextValue = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, logout, updateUser }),
    [user, login, logout, updateUser]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
