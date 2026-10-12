"use client";
import { useState } from "react";
import { AddCircleIcon, PenIcon, TrashBinTrashIcon } from "@solar-icons/react/linear";
import { useResource } from "@/components/hooks/use-resource";
import { PageHeading } from "@/components/shell/page-heading";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/ui/category-icon";
import { DataState } from "@/components/ui/feedback";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { CategoryForm } from "@/components/forms/category-form";

export function CategoryManager() {
  const resource = useResource("/api/categories");
  const [editor, setEditor] = useState(undefined);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState("");
  function refresh(message) { resource.refresh(); setNotice(message); }
  return <>
    <PageHeading title="Kategori" subtitle="Kelompok barang untuk kebutuhan Anda."><Button onClick={() => setEditor(null)}><AddCircleIcon size={18} />Tambah kategori</Button></PageHeading>
    {notice && <p role="status" className="catalog-count">{notice}</p>}
    <DataState {...resource} retry={resource.refresh} empty={!resource.data.length}><h2>Belum ada kategori</h2><p>Tambahkan kategori sebelum membuat barang.</p><Button onClick={() => setEditor(null)}><AddCircleIcon size={18} />Tambah kategori</Button></DataState>
    {!resource.loading && !resource.error && <ul className="category-list">{resource.data.map((item) => <li key={item.id}><div><h2><CategoryIcon name={item.name} icon={item.icon} size={18} className="mr-2 inline align-text-bottom" />{item.name}</h2><p>{item.productCount} barang</p></div><div className="row-actions"><Button variant="ghost" size="icon" title="Edit kategori" aria-label={`Edit ${item.name}`} onClick={() => setEditor(item)}><PenIcon size={18} /></Button><Button variant="ghost" size="icon" title="Hapus kategori" aria-label={`Hapus ${item.name}`} onClick={() => setDeleting(item)}><TrashBinTrashIcon size={18} /></Button></div></li>)}</ul>}
    {editor !== undefined && <CategoryForm item={editor} onClose={() => setEditor(undefined)} onSaved={() => refresh("Kategori berhasil disimpan.")} />}
    {deleting && <ConfirmDelete item={deleting} endpoint="/api/categories" onClose={() => setDeleting(null)} onDeleted={() => refresh("Kategori berhasil dihapus.")} />}
  </>;
}