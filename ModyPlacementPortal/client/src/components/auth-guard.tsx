import { useEffect } from "react";
import { useLocation } from "wouter";
import { isAuthenticated, getAuthUser } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireRole?: "student" | "admin";
}

export function AuthGuard({ children, requireRole }: AuthGuardProps) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated()) {
      setLocation("/login");
      return;
    }

    if (requireRole) {
      const user = getAuthUser();
      if (user?.role !== requireRole) {
        setLocation("/login");
      }
    }
  }, [setLocation, requireRole]);

  if (!isAuthenticated()) {
    return null;
  }

  if (requireRole) {
    const user = getAuthUser();
    if (user?.role !== requireRole) {
      return null;
    }
  }

  return <>{children}</>;
}
