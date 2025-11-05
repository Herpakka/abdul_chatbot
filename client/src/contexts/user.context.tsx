import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import Axios from "axios";
import { useRouter } from "next/navigation";
import { getCookie } from "./context-utils";

interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

interface UserContextType {
  user: User | null;
  updateUser?: (username: string, password: string) => void;
  validateOldPassword?: (oldPassword: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }): React.ReactElement => {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth`;

  const logout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    router.push("/auth/login");
  };

  const validateOldPassword = async (oldPassword: string): Promise<boolean> => {
    const token = getCookie("token");
    if (!token) {
      console.error("No token found in cookies.");
      return false;
    }
    try {
      const response = await Axios.post(`${authUrl}/validate`, {
        userId: user?.id,
        password: oldPassword
      }, {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.checking === "ok") {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error validating old password:", error);
      return false;
    }
  };

  const updateUser = async (username: string, password: string) => {
    const uid = user.id
    console.log("Updating user with:", { username, password });
    
    try {
      Axios.put(`${authUrl}/update`, {
        id: uid,
        username,
        ...(password ? { password } : {})
      }, {
        headers: { Authorization: `Bearer ${getCookie("token")}` },
      }).then((res) => {
        console.log("User updated:", res.data);
        setUser(res.data);
        setError(null);
      }).catch((error) => {
        console.error("Error updating user:", error);
      });
    } catch (error) {
      console.error("Error updating user:", error);
    }

  };

  useEffect(() => {
    const token = getCookie("token");
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }
    Axios.get(`${authUrl}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        setUser(res.data);
        setError(null);
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          setError("Session expired. Please login again.");
          setUser(null);
        } else {
          setError("Failed to verify user.");
          setUser(null);
        }
        router.push("/auth/login");
      })
      .finally(() => setLoading(false));
  }, []);

  // const refreshUser = () => {
  //   const token = getCookie("token");
  //   if (!token) {
  //     setLoading(false);
  //     setUser(null);
  //     return;
  //   }
  //   Axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/profile`, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   })
  //     .then((res) => {
  //       setUser(res.data);
  //       setError(null);
  //     })
  //     .catch((err) => {
  //       if (err.response && err.response.status === 401) {
  //         setError("Session expired. Please login again.");
  //         setUser(null);
  //       } else {
  //         setError("Failed to verify user.");
  //         setUser(null);
  //       }
  //       router.push("/auth/login");
  //     })
  //     .finally(() => setLoading(false));
  // };

  return (
    <UserContext.Provider value={{ user, updateUser, validateOldPassword, loading, error, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
