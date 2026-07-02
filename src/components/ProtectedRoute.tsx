import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../lib/axiosInstance";
import { UserDataContext } from "../context/userContext";

interface ProtectedProps {
  children: React.ReactNode;
  allowedRoles: ("user" | "admin" | "sudoadmin")[];
  redirectTo?: string;
}
interface UsersData {
  id: number;
  email: string;
  role: "user" | "admin" | "sudoadmin" | null;
  user_name: string;
  profile_url: string | null;
}

const ProtectedRoute = ({
  children,
  allowedRoles,
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
      } catch (err) {
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
    return <div>Loading...</div>;
  }

  if (!user.role) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;