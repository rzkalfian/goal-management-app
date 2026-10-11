"use client";
import { useState } from "react";
import Image from "next/image";
import { PenIcon, TrashBinTrashIcon, BagIcon, SquareArrowRightUpIcon, CheckCircleIcon, RepeatIcon, HeartIcon } from "@solar-icons/react/linear";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/ui/category-icon";
import { STATUSES } from "@/core/entities/product";

export function ProductCard({ product, onEdit, onDelete }) {
  const [failed, setFailed] = useState(false);
  const StatusIcon = product.status === "SUDAH_DIBELI" ? CheckCircleIcon : product.status === "SERING_DIBELI" ? RepeatIcon : HeartIcon;
  return <article className="product-card">
    <div className="product-image">{product.imageUrl && !failed ? <Image src={product.imageUrl} alt={product.title} width={600} height={600} unoptimized onError={() => setFailed(true)} /> : <div className="image-placeholder"><CategoryIcon name={product.category} size={36} strokeWidth={1.5} /><span>{product.category}</span></div>}</div>
    <div className="product-info"><h2>{product.title}</h2><div className="product-badges"><span className="badge"><StatusIcon size={12} />{STATUSES[product.status]}</span><span className="badge badge-neutral">{product.category}</span></div></div>
    <div className="product-actions">
      <Button asChild variant="ghost" size="icon" className="purchase-link"><a href={product.buyUrl} target="_blank" rel="noopener noreferrer" title="Link pembelian" aria-label={`Beli ${product.title}`}><BagIcon size={18} /></a></Button>
      {product.affiliateUrl && <Button asChild variant="ghost" size="icon"><a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer" title="Link affiliate" aria-label={`Affiliate ${product.title}`}><SquareArrowRightUpIcon size={18} /></a></Button>}
      <Button variant="ghost" size="icon" onClick={() => onEdit(product)} title="Edit barang" aria-label={`Edit ${product.title}`}><PenIcon size={17} /></Button>
      <Button variant="ghost" size="icon" onClick={() => onDelete(product)} title="Hapus barang" aria-label={`Hapus ${product.title}`}><TrashBinTrashIcon size={17} /></Button>
    </div>
  </article>;
}