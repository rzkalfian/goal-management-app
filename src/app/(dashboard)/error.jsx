"use client";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }) {
  return <div className="data-state"><h1>Halaman tidak dapat dimuat</h1><p>Periksa koneksi lalu coba lagi.</p><Button onClick={reset}><RefreshCw size={18} />Coba lagi</Button></div>;
}