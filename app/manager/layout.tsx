"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../../services/AuthService";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.replace("/login");
      return;
    }
    if (!authService.hasRole(["MANAGER"])) {
      const role = authService.getRole();
      if (role === "ADMIN" || role === "SUPER-ADMIN") router.replace("/admin/dashboard");
      else if (role === "PROVIDER") router.replace("/provider/dashboard");
      else router.replace("/login");
      return;
    }
    setAuthorized(true);
  }, [router]);

  if (!authorized) return null;

  return <>{children}</>;
}
