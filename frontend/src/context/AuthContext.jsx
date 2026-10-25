
import {
  createContext,
  useContext,
  useState,
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

  function login(result) {
    sessionStorage.setItem("accessToken", result.accessToken);
    sessionStorage.setItem("refreshToken", result.refreshToken);
    sessionStorage.setItem("user", JSON.stringify(result.user));

    setUser(result.user);
  }

  async function logout() {
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
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
