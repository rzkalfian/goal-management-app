"use client";
import { useState } from "react";
import { DisketteIcon } from "@solar-icons/react/linear";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ErrorMessage } from "@/components/ui/feedback";
import { STATUSES } from "@/core/entities/product";
import { request } from "@/components/hooks/request";

export function ProductForm({ item, categories, onClose, onSaved }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await request(item ? `/api/products/${item.id}` : "/api/products", {
        method: item ? "PUT" : "POST",
        body: Object.fromEntries(new FormData(event.currentTarget)),
      });
      onSaved();
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
      title={item ? "Edit barang" : "Tambah barang"}
      description="Simpan barang dan tautan pembeliannya."
    >
      <form onSubmit={submit} className="form-stack">
        <Field
          name="title"
          label="Nama produk"
          required
          maxLength={160}
          defaultValue={item?.title || ""}
          autoFocus
        />
        <div className="form-row">
          <Field name="status" label="Status">
            <select
              id="status"
              name="status"
              defaultValue={item?.status || "WISHLIST"}
            >
              {Object.entries(STATUSES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field name="categoryId" label="Kategori">
            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={item?.categoryId || categories[0]?.id || ""}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field
          name="buyUrl"
          label="Link pembelian"
          type="url"
          required
          maxLength={2048}
          defaultValue={item?.buyUrl || ""}
          placeholder="https://"
        />
        <Field
          name="affiliateUrl"
          label="Link affiliate (opsional)"
          type="url"
          maxLength={2048}
          defaultValue={item?.affiliateUrl || ""}
          placeholder="https://"
        />
        <ErrorMessage message={error} />
        <div className="form-actions">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Batal
          </Button>
          <Button type="submit" disabled={busy || !categories.length}>
            <DisketteIcon size={18} />
            {busy ? "Menyimpan..." : "Simpan barang"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
