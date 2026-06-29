import axios from "axios";
import { createContext, useEffect, useState } from "react";

interface UsersData {
  id: number;
  email: string;
  role: "user" | "admin" | "sudoadmin" | null;
  user_name: string;
  profile_url: string | null;
}

interface UserContextData {
  user: UsersData;
  setUser: React.Dispatch<React.SetStateAction<UsersData>>;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

export const UserDataContext = createContext<UserContextData | null>(null);

const UserContext = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UsersData>({
    id: 0,
    email: "",
    role: null,
    user_name: "",
    profile_url: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchFromProfile = async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_API}/profile`,
      { withCredentials: true }
    );
    setUser(res.data.user);
  };

  const refreshUser = async () => {
    try {
      await fetchFromProfile();
    } catch (err) {
      console.error("Could not refresh user", err);
    }
  };

  useEffect(() => {
    const FetchUser = async () => {
      try {
        await fetchFromProfile();
      } catch (err) {
        try {
          await axios.post(
            `${import.meta.env.VITE_BACKEND_API}/refresh-token`,
            {},
            { withCredentials: true }
          );
          console.log("access token refreshed");
          await fetchFromProfile();
        } catch (err) {
          console.error("Session expired. Please login again.", err);
        }
      } finally {
        setLoading(false);
      }
    };
    FetchUser();
  }, []);

  return (
    <UserDataContext.Provider value={{ user, setUser, loading, refreshUser }}>
      {children}
    </UserDataContext.Provider>
  );
};

export default UserContext;