"use client";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  function toggle() {
    const dark = document.documentElement.classList.toggle("dark");
    try { localStorage.setItem("goals-theme", dark ? "dark" : "light"); } catch {}
  }
  return <Button variant="ghost" size="icon" onClick={toggle} title="Ganti tema" aria-label="Ganti tema">
    <Moon size={20} className="light-icon" /><Sun size={20} className="dark-icon" />
  </Button>;
}