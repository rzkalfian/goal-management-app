import Image from "next/image";
import { ImageOff, Pencil, Trash2, ShoppingBag, ExternalLink, Check, Repeat2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATUSES } from "@/core/entities/product";

export function ProductCard({ product, onEdit, onDelete }) {
  const StatusIcon = product.status === "SUDAH_DIBELI" ? Check : product.status === "SERING_DIBELI" ? Repeat2 : Heart;
  return <article className="product-card">
    <div className="product-image">{product.imageUrl ? <Image src={product.imageUrl} alt={product.title} width={600} height={600} unoptimized /> : <div className="image-placeholder"><ImageOff size={28} strokeWidth={1.5} /><span>Belum ada gambar</span></div>}</div>
    <div className="product-info"><h2>{product.title}</h2><div className="product-badges"><span className="badge"><StatusIcon size={12} />{STATUSES[product.status]}</span><span className="badge badge-neutral">{product.category}</span></div></div>
    <div className="product-actions">
      <Button asChild variant="ghost" size="icon" className="purchase-link"><a href={product.buyUrl} target="_blank" rel="noopener noreferrer" title="Link pembelian" aria-label={`Beli ${product.title}`}><ShoppingBag size={18} /></a></Button>
      {product.affiliateUrl && <Button asChild variant="ghost" size="icon"><a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer" title="Link affiliate" aria-label={`Affiliate ${product.title}`}><ExternalLink size={18} /></a></Button>}
      <Button variant="ghost" size="icon" onClick={() => onEdit(product)} title="Edit barang" aria-label={`Edit ${product.title}`}><Pencil size={17} /></Button>
      <Button variant="ghost" size="icon" onClick={() => onDelete(product)} title="Hapus barang" aria-label={`Hapus ${product.title}`}><Trash2 size={17} /></Button>
    </div>
  </article>;
}