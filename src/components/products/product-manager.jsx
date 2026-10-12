"use client";
import { useDeferredValue, useState } from "react";
import Link from "next/link";
import { AddCircleIcon, RestartIcon } from "@solar-icons/react/linear";
import { useResource } from "@/components/hooks/use-resource";
import { PageHeading } from "@/components/shell/page-heading";
import { Button } from "@/components/ui/button";
import { DataState } from "@/components/ui/feedback";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { ProductForm } from "@/components/forms/product-form";
import { ProductCard } from "./product-card";
import { ProductFilters } from "./product-filters";

export function ProductManager() {
  const products = useResource("/api/products");
  const categories = useResource("/api/categories");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const search = useDeferredValue(query).toLowerCase();
  const [editor, setEditor] = useState(undefined);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState("");
  const filtered = products.data.filter(
    (item) =>
      (!status || item.status === status) &&
      (!category || item.categoryId === category) &&
      item.title.toLowerCase().includes(search),
  );
  const loading = products.loading || categories.loading;
  const error = products.error || categories.error;
  function refresh(message) {
    products.refresh();
    categories.refresh();
    setNotice(message);
  }
  function resetFilters() {
    setStatus("");
    setCategory("");
    setQuery("");
  }
  return (
    <>
      <PageHeading
        title="Daftar barang"
        subtitle="Wishlist, kebutuhan rutin, dan barang yang sudah Anda beli."
      >
        <Button
          onClick={() => setEditor(null)}
          disabled={loading || !!error || !categories.data.length}
        >
          <AddCircleIcon size={18} />
          Tambah barang
        </Button>
      </PageHeading>
      <ProductFilters
        products={products.data}
        categories={categories.data}
        {...{ status, setStatus, query, setQuery, category, setCategory }}
      />
      {notice && (
        <p className="catalog-count" role="status">
          {notice}
        </p>
      )}
      {!loading && !error && (
        <p className="catalog-count">{filtered.length} barang ditampilkan</p>
      )}
      <DataState
        loading={loading}
        error={error}
        retry={() => refresh("")}
        empty={!filtered.length}
      >
        <h2>
          {products.data.length
            ? "Tidak ada barang yang cocok"
            : "Daftar barang masih kosong"}
        </h2>
        <p>
          {products.data.length
            ? "Ubah pencarian atau filter yang dipilih."
            : "Tambahkan barang pertama ke wishlist Anda."}
        </p>
        {products.data.length ? (
          <Button variant="outline" onClick={resetFilters}>
            <RestartIcon size={18} />
            Reset filter
          </Button>
        ) : categories.data.length ? (
          <Button onClick={() => setEditor(null)}>
            <AddCircleIcon size={18} />
            Tambah barang
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href="/categories">Tambah kategori terlebih dahulu</Link>
          </Button>
        )}
      </DataState>
      {!loading && !error && !!filtered.length && (
        <div className="product-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
          {filtered.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              onEdit={setEditor}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}
      {editor !== undefined && (
        <ProductForm
          item={editor}
          categories={categories.data}
          onClose={() => setEditor(undefined)}
          onSaved={() => refresh("Barang berhasil disimpan.")}
        />
      )}
      {deleting && (
        <ConfirmDelete
          item={deleting}
          endpoint="/api/products"
          onClose={() => setDeleting(null)}
          onDeleted={() => refresh("Barang berhasil dihapus.")}
        />
      )}
    </>
  );
}
