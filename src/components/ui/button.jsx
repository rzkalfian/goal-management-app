import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva("button", {
  variants: { variant: { default: "button-primary", outline: "button-outline", ghost: "button-ghost", destructive: "button-danger" }, size: { default: "", icon: "button-icon" } },
  defaultVariants: { variant: "default", size: "default" },
});
export function Button({ className, variant, size, asChild = false, type = "button", ...props }) {
  const Component = asChild ? Slot : "button";
  return <Component {...(!asChild ? { type } : {})} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}