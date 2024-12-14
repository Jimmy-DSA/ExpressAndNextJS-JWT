"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  getSessionClientSide,
  logoutAction,
  refreshExpiredToken,
} from "../authActions";

export type session = {
  token: string;
  expiresAt: string;
  refreshToken: string;
};

type AuthContextType = {
  token: string | null;
  expiresAt: string | null;
  refreshToken: string | null;
  firstLoad: boolean;
  checkToken: (
    expiresAtByParam?: string
  ) => Promise<"ok" | "refreshing" | null | session>;
  lastRefresh: number;
  showSessionExpiredModal: boolean;
  setShowSessionExpiredModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export const isTokenExpired = (expiresAt: string): boolean => {
  const expirationDate = new Date(expiresAt).getTime();
  const currentTime = Date.now();
  return currentTime >= expirationDate;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [lastRefresh, setLastRefresh] = useState(0);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  const isRefreshing = useRef(false);

  const getAuth = async () => {
    const auth = await getSessionClientSide();
    console.log("auth:", auth);
    setToken(auth.token);
    setExpiresAt(auth.expiresAt);
    setRefreshToken(auth.refreshToken);
    setFirstLoad(false);
    return {
      token: auth.token,
      expiresAt: auth.expiresAt,
      refreshToken: auth.refreshToken,
    };
  };

  const checkToken = async (
    expiresAtByParam?: string
  ): Promise<"ok" | "refreshing" | null | session> => {
    if (expiresAtByParam) {
      if (isTokenExpired(expiresAtByParam)) {
        if (isRefreshing.current) {
          console.log("already refreshing token...");
          return "refreshing";
        }
        isRefreshing.current = true;
        console.log("token expired");
        const refreshSuccesfull = await refreshExpiredToken();
        if (!refreshSuccesfull) {
          isRefreshing.current = false;
          return null;
        } else {
          setLastRefresh(new Date().getMilliseconds());
          const updatedSession = await getAuth();
          isRefreshing.current = false;
          return updatedSession;
        }
      } else {
        console.log("token still valid");
        return "ok";
      }
    } else {
      if (!expiresAt) {
        console.log("without expiration date");
        await logoutAction();
        return null;
      }
      if (isTokenExpired(expiresAt)) {
        if (isRefreshing.current) {
          console.log("already refreshing token...");
          return "refreshing";
        }
        isRefreshing.current = true;
        console.log("token expired");
        const refreshSuccesfull = await refreshExpiredToken();
        if (!refreshSuccesfull) {
          isRefreshing.current = false;
          return null;
        } else {
          setLastRefresh(new Date().getMilliseconds());
          const updatedSession = await getAuth();
          isRefreshing.current = false;
          return updatedSession;
        }
      } else {
        console.log("token still valid");
        return "ok";
      }
    }
  };

  useEffect(() => {
    getAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        expiresAt,
        refreshToken,
        firstLoad,
        checkToken,
        lastRefresh,
        showSessionExpiredModal,
        setShowSessionExpiredModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
