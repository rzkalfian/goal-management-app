"use client";
import { useState } from "react";
import { DisketteIcon } from "@solar-icons/react/linear";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ErrorMessage } from "@/components/ui/feedback";
import { request } from "@/components/hooks/request";

export function UserForm({ item, currentId, onClose, onSaved }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const form = Object.fromEntries(new FormData(event.currentTarget));
      if (item?.id === currentId) form.role = item.role;
      await request(item ? `/api/users/${item.id}` : "/api/users", { method: item ? "PUT" : "POST", body: form });
      onSaved(item?.id === currentId); onClose();
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  return <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }} title={item ? "Edit pengguna" : "Tambah pengguna"} description="Perubahan akun mengakhiri sesi pengguna tersebut.">
    <form onSubmit={submit} className="form-stack">
      <Field name="email" label="Email" type="email" required defaultValue={item?.email || ""} maxLength={254} autoComplete="off" />
      <Field name="role" label="Role"><select id="role" name="role" defaultValue={item?.role || "ADMIN"} disabled={item?.id === currentId}><option value="ADMIN">Admin</option><option value="DEVELOPER">Developer</option></select></Field>
      <Field name="password" label={item ? "Password baru (opsional)" : "Password"} type="password" autoComplete="new-password" required={!item} minLength={12} maxLength={128} hint={item ? "Kosongkan untuk mempertahankan password. Minimal 12 karakter jika diubah." : "Minimal 12 karakter."} />
      <ErrorMessage message={error} />
      <div className="form-actions"><Button variant="outline" onClick={onClose} disabled={busy}>Batal</Button><Button type="submit" disabled={busy}><DisketteIcon size={18} />{busy ? "Menyimpan..." : "Simpan pengguna"}</Button></div>
    </form>
  </Dialog>;
}