"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BoxIcon,
  TagIcon,
  UsersGroupRoundedIcon,
  DatabaseIcon,
  LogoutIcon,
} from "@solar-icons/react/linear";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { InstallButton } from "./install-button";

export function Navigation({ user }) {
  const path = usePathname();
  const links = [
    ["/products", "Barang", BoxIcon],
    ["/categories", "Kategori", TagIcon],
    ["/users", "Pengguna", UsersGroupRoundedIcon],
  ];
  if (user.role === "DEVELOPER")
    links.push(["/system", "Sistem", DatabaseIcon]);
  return (
    <header className="app-header">
      <div className="section-inner header-inner">
        <Link href="/products" className="brand">
          Goals<span>Management</span>
        </Link>
        <nav aria-label="Navigasi utama">
          {links.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              aria-current={path === href ? "page" : undefined}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <InstallButton />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            title="Keluar"
            aria-label="Keluar"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogoutIcon size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
}
