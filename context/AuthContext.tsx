"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { $get, $post } from "@/lib/api";
import type { AxiosError } from "axios";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isEmailVerified: boolean;
  createdAt: string;
}

interface AuthResponse {
  status: "success" | "error";
  data: User;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // helper to call /auth/me
  const refreshUser = async (): Promise<boolean> => {
    try {
      const resp = await $get<AuthResponse>("/auth/me");
      if (resp.status === "success") {
        setUser(resp.data);
        return true;
      }
      setUser(null);
      return false;
    } catch {
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    // exact‐match "/" plus prefix matches for everything else
    const PUBLIC_PATHS = [
      "/",                       // home
      "/search-results",
      "/destinations",
      "/about",
      "/contact",
      "/faqs",
      "/offers",
      "/booking",
      "/auth/login",
      "/auth/register",
      "/auth/forgot-password",
      "/auth/verify-otp",
      "/auth/reset-password",
    ];

    // Decide if current pathname is public:
    const isPublic = PUBLIC_PATHS.some((p) =>
      p === "/" ? pathname === "/" : pathname.startsWith(p)
    );

    setLoading(true);
    refreshUser().then((isAuth) => {
      setLoading(false);
      // If it's not public and user isn't authed, redirect
      if (!isPublic && !isAuth) {
        router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      }
    });
  }, [pathname, router]);

  // login
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await $post<{ status: string; message?: string }, { email: string; password: string }>(
        "/auth/login",
        { email, password }
      );
      await refreshUser();
      router.replace("/");
    } catch (err: any) {
      const msg =
        (err as AxiosError<{ message?: string }>).response?.data?.message ||
        err.message ||
        "Login failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // logout
  const logout = async () => {
    setLoading(true);
    try {
      await $post<{ status: string }, {}>("/auth/logout", {});
      setUser(null);
      router.replace("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  // while checking auth
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <svg className="animate-spin h-12 w-12 text-blue-600" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75" />
        </svg>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: Boolean(user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
