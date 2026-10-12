"use client";
import { RefreshIcon } from "@solar-icons/react/linear";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }) {
  return (
    <div className="data-state">
      <h1>Halaman tidak dapat dimuat</h1>
      <p>Periksa koneksi lalu coba lagi.</p>
      <Button onClick={reset}>
        <RefreshIcon size={18} />
        Coba lagi
      </Button>
    </div>
  );
}
