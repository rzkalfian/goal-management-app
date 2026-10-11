"use client";
import * as Primitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "./button";

export function Dialog({ open, onOpenChange, title, description, children }) {
  return <Primitive.Root open={open} onOpenChange={onOpenChange}>
    <Primitive.Portal>
      <Primitive.Overlay className="dialog-overlay" />
      <Primitive.Content className="dialog-content">
        <div className="dialog-heading">
          <div><Primitive.Title>{title}</Primitive.Title><Primitive.Description>{description}</Primitive.Description></div>
          <Primitive.Close asChild><Button variant="ghost" size="icon" aria-label="Tutup dialog" title="Tutup dialog"><X size={20} /></Button></Primitive.Close>
        </div>
        {children}
      </Primitive.Content>
    </Primitive.Portal>
  </Primitive.Root>;
}