"use client";
import { useState } from "react";
import { Save } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/feedback";
import { request } from "@/components/hooks/request";

export function CategoryForm({ item, onClose, onSaved }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      await request(item ? `/api/categories/${item.id}` : "/api/categories", { method: item ? "PUT" : "POST", body: Object.fromEntries(new FormData(event.currentTarget)) });
      onSaved(); onClose();
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  return <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }} title={item ? "Edit kategori" : "Tambah kategori"} description="Kelompokkan barang sesuai kebutuhan.">
    <form onSubmit={submit} className="form-stack"><Field name="name" label="Nama kategori" defaultValue={item?.name || ""} required maxLength={60} autoFocus /><ErrorMessage message={error} /><div className="form-actions"><Button variant="outline" onClick={onClose} disabled={busy}>Batal</Button><Button type="submit" disabled={busy}><Save size={18} />{busy ? "Menyimpan..." : "Simpan kategori"}</Button></div></form>
  </Dialog>;
}