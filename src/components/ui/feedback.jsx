import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";
export function ErrorMessage({ message }) {
  return message ? <p className="error-message" role="alert">{message}{message.startsWith("Sesi berakhir") && <> <Link href="/login">Masuk kembali</Link></>}</p> : null;
}
export function DataState({ loading, error, retry, empty, children }) {
  if (loading) return <div className="data-state" role="status">Memuat data...</div>;
  if (error) return <div className="data-state"><ErrorMessage message={error} /><Button variant="outline" onClick={retry}><RefreshCw size={18} />Coba lagi</Button></div>;
  if (empty) return <div className="data-state">{children}</div>;
  return null;
}