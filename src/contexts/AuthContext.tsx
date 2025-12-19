"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { login as loginApi, logout as logoutApi } from "@/src/services/auth-service";

type User = {
  username: string;
  roles: string[];
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        setUser(user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  async function login(username: string, password: string) {
    await loginApi({ username, password });
    setUser(user);
    router.push("/dashboard");
  }

  async function logout() {
    await logoutApi();
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
