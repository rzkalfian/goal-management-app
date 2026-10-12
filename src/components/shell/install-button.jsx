"use client";
import { useState } from "react";
import { DownloadIcon } from "@solar-icons/react/linear";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "./pwa-register";

export function InstallButton() {
  const { prompt, clear } = useInstallPrompt();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!prompt)
    return error ? (
      <span className="pwa-error" role="alert">
        {error}
      </span>
    ) : null;
  async function install() {
    setBusy(true);
    setError("");
    try {
      await prompt.prompt();
      await prompt.userChoice;
      clear();
    } catch {
      setError("Instalasi gagal. Coba lagi dari menu browser.");
      clear();
    } finally {
      setBusy(false);
    }
  }
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Instal aplikasi"
      title="Instal aplikasi"
      onClick={install}
      disabled={busy}
    >
      <DownloadIcon size={20} />
    </Button>
  );
}
