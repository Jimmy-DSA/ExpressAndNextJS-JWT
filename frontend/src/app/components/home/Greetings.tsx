"use client";

import { useCookies } from "next-client-cookies";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/contexts/authContext";
import { isTokenExpired } from "@/app/contexts/authContext";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import CheckIcon from "@mui/icons-material/Check";
import { config } from "../../config";

export default function Greetings() {
  const [userData, setUserData] = useState<{
    username: string;
    id: string;
  } | null>(null);
  const cookies = useCookies();
  const [message, setMessage] = useState<string | undefined>();
  const [checkingToken, setCheckingToken] = useState(false);
  const [checkingMessage, setCheckingMessage] = useState("");
  const firstRender = useRef(true);

  const {
    token,
    expiresAt,
    firstLoad,
    checkToken,
    lastRefresh,
    setShowSessionExpiredModal,
  } = useAuth();

  const expiresAtRef = useRef(expiresAt);

  useEffect(() => {
    expiresAtRef.current = expiresAt;
  }, [expiresAt]);

  const verifyRefresh = async () => {
    console.log("verifyRefresh()");
    if (!expiresAtRef.current) {
      console.log("expiresAt still null");
      return;
    }
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    console.log("expiresAtRef:", expiresAtRef.current);
    console.log("is expired ref:", isTokenExpired(expiresAtRef.current!));
    setCheckingToken(true);
    setCheckingMessage("Verificando validade do token...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (isTokenExpired(expiresAtRef.current!)) {
      setCheckingMessage("Token expirado, renovando...");
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const check = await checkToken(expiresAtRef.current!);
    if (check === null) {
      setCheckingMessage("Token inválido...");
      setShowSessionExpiredModal(true);
      setCheckingToken(false);
      return;
    } else if (check === "ok") {
      setCheckingToken(false);
      setCheckingMessage("Token válido.");
    } else if (typeof check === "object") {
      setCheckingToken(false);
      setCheckingMessage("Token renovado com sucesso.");
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  };

  const REQUEST_PROTECTED_ROUTE = async () => {
    console.log("token:", token);
    console.log("expiresAt:", expiresAt);
    console.log("is expired:", isTokenExpired(expiresAt!));

    let validToken = token;

    const check = await checkToken();

    if (check === "refreshing") {
      return;
    }

    if (check === null) {
      setShowSessionExpiredModal(true);
      return;
    }

    if (check !== "ok") {
      validToken = check.token;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API}/auth/welcome`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      setMessage(data.message);
    } else {
      console.log("Erro na requisição:", response.status);
    }
  };

  useEffect(() => {
    const storedUserData = cookies.get("user_data");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, [cookies]);

  useEffect(() => {
    if (firstLoad) {
      console.log("loading auth context");
      return;
    }
    REQUEST_PROTECTED_ROUTE();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstLoad, lastRefresh]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    const runInterval = async () => {
      if (!isMounted) return;
      await verifyRefresh();
      timeoutId = setTimeout(runInterval, 5000);
    };
    runInterval();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log("expiresAt changed:", expiresAt);
  }, [expiresAt]);

  if (!userData?.username || !message) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <div className="text-center">{`Seja bem vindo ${userData?.username}!`}</div>
      <div className="text-center text-green-500">{message}</div>
      {expiresAt ? (
        <div className="mt-4 text-center text-gray-400">
          Expira as{" "}
          {new Date(expiresAt).toLocaleTimeString("pt-BR", { hour12: false })}
        </div>
      ) : (
        <div className="mt-4 text-center text-gray-400">Expira as 00:00:00</div>
      )}

      <div style={{ height: 40 }}></div>
      {checkingToken && (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyItems: "center",
              justifyContent: "center",
              height: 40,
            }}
          >
            <CircularProgress
              style={{ width: 30, height: 30 }}
              color={"success"}
            />
          </Box>
        </>
      )}
      {(checkingMessage === "Token válido." ||
        checkingMessage === "Token renovado com sucesso.") && (
        <div className="flex items-center justify-center">
          <CheckIcon
            color={"success"}
            style={{ width: 40, height: 40 }}
          ></CheckIcon>
        </div>
      )}
      <div style={{ textAlign: "center" }}>{checkingMessage}</div>
    </div>
  );
}
