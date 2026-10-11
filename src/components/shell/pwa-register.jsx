"use client";
import { createContext, useContext, useEffect, useState } from "react";

const InstallContext = createContext(null);
export const useInstallPrompt = () => useContext(InstallContext);

export function PwaRegister({ children }) {
  const [prompt, setPrompt] = useState(null);
  useEffect(() => {
    function available(event) { event.preventDefault(); setPrompt(event); }
    function installed() { setPrompt(null); }
    window.addEventListener("beforeinstallprompt", available);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", available);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);
  useEffect(() => {
    if (!window.isSecureContext || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((error) => console.error("PWA registration failed:", error.message));
  }, []);
  return <InstallContext.Provider value={{ prompt, clear: () => setPrompt(null) }}>{children}</InstallContext.Provider>;
}