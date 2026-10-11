"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Save } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ErrorMessage } from "@/components/ui/feedback";
import { STATUSES } from "@/core/entities/product";
import { request } from "@/components/hooks/request";

export function ProductForm({ item, categories, onClose, onSaved }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(item?.imageUrl || "");
  useEffect(() => () => { if (preview.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);
  function chooseImage(event) {
    const file = event.target.files?.[0];
    if (file?.size > 5 * 1024 * 1024) { event.target.value = ""; setError("Gambar maksimal 5 MB."); return; }
    setError(""); setPreview(file ? URL.createObjectURL(file) : item?.imageUrl || "");
  }
  async function submit(event) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      await request(item ? `/api/products/${item.id}` : "/api/products", { method: item ? "PUT" : "POST", body: new FormData(event.currentTarget) });
      onSaved(); onClose();
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  return <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }} title={item ? "Edit barang" : "Tambah barang"} description="Simpan barang dan tautan pembeliannya.">
    <form onSubmit={submit} className="form-stack">
      <Field name="title" label="Nama produk" required maxLength={160} defaultValue={item?.title || ""} autoFocus />
      <div className="form-row">
        <Field name="status" label="Status"><select id="status" name="status" defaultValue={item?.status || "WISHLIST"}>{Object.entries(STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
        <Field name="categoryId" label="Kategori"><select id="categoryId" name="categoryId" required defaultValue={item?.categoryId || categories[0]?.id || ""}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
      </div>
      <Field name="buyUrl" label="Link pembelian" type="url" required maxLength={2048} defaultValue={item?.buyUrl || ""} placeholder="https://" />
      <Field name="affiliateUrl" label="Link affiliate (opsional)" type="url" maxLength={2048} defaultValue={item?.affiliateUrl || ""} placeholder="https://" />
      <Field name="image" label="Gambar produk (opsional)" type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} hint="JPEG, PNG, atau WebP. Maksimal 5 MB." />
      {preview && <Image className="image-preview" src={preview} alt="Preview gambar produk" width={400} height={180} unoptimized />}
      {item?.imageUrl && <label className="checkbox-field"><input type="checkbox" name="removeImage" value="true" />Hapus gambar lama</label>}
      <ErrorMessage message={error} />
      <div className="form-actions"><Button variant="outline" onClick={onClose} disabled={busy}>Batal</Button><Button type="submit" disabled={busy || !categories.length}><Save size={18} />{busy ? "Menyimpan..." : "Simpan barang"}</Button></div>
    </form>
  </Dialog>;
}