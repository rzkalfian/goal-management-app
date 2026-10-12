"use client";
import { useState } from "react";
import { TrashBinTrashIcon } from "@solar-icons/react/linear";
import { Dialog } from "./dialog";
import { Button } from "./button";
import { ErrorMessage } from "./feedback";
import { request } from "@/components/hooks/request";

export function ConfirmDelete({ item, endpoint, onClose, onDeleted }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function remove() {
    setBusy(true);
    setError("");
    try {
      await request(`${endpoint}/${item.id}`, { method: "DELETE" });
      onDeleted();
      onClose();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
      title="Hapus data?"
      description={`Hapus ${item.title || item.name || item.email}? Tindakan ini tidak dapat dibatalkan.`}
    >
      <ErrorMessage message={error} />
      <div className="form-actions">
        <Button variant="outline" onClick={onClose} disabled={busy}>
          Batal
        </Button>
        <Button variant="destructive" onClick={remove} disabled={busy}>
          <TrashBinTrashIcon size={18} />
          {busy ? "Menghapus..." : "Hapus"}
        </Button>
      </div>
    </Dialog>
  );
}
