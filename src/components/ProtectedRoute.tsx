import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../lib/axiosInstance";
import { UserDataContext } from "../context/userContext";

interface ProtectedProps {
  children: React.ReactNode;
  allowedRoles: ("user" | "admin" | "sudoadmin")[];
  redirectTo?: string;
}

const ProtectedRoute = ({
  children,
  redirectTo = "/login",
}: ProtectedProps) => {

  const context = useContext(UserDataContext);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
        if (!context) return ;
  const {setUser,  sessionExpire } = context;
      try {
        const res = await api.get("/profile");
        setUser(res.data.user);
      } catch {
        sessionExpire();
      } finally {
        setCheckingAuth(false);
      }
    };

    verifySession();
  }, []);
if (!context) {
    return null;
  }
  const { user } = context;

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ivory-100">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900">
          <span className="font-display text-[15px] font-medium text-white">CH</span>
        </div>
        <div className="h-1 w-32 overflow-hidden rounded-full bg-ivory-300">
          <div className="h-full w-1/2 animate-[indeterminate_1.2s_ease-in-out_infinite] rounded-full bg-sage-600" />
        </div>
        <style>{`@keyframes indeterminate { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
      </div>
    );
  }

  if (!user.role) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;