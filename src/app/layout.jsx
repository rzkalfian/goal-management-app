import "@fontsource/roboto/latin-400.css";
import "@fontsource/roboto/latin-500.css";
import "@fontsource/roboto/latin-600.css";
import "./globals.css";
import { PwaRegister } from "@/components/shell/pwa-register";

export const metadata = {
  title: { default: "Goals Management", template: "%s | Goals Management" },
  description: "Wishlist dan daftar barang pribadi.", applicationName: "Goals Management",
  appleWebApp: { capable: true, title: "Goals", statusBarStyle: "default" },
  icons: { icon: "/icons/favicon-32.png", apple: "/icons/apple-touch-icon.png" },
};
export const viewport = {
  width: "device-width", initialScale: 1, viewportFit: "cover",
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f9fafb" }, { media: "(prefers-color-scheme: dark)", color: "#06040d" }],
};
const themeScript = `try{document.documentElement.classList.toggle('dark',localStorage.getItem('goals-theme')==='dark')}catch{}`;
export default function RootLayout({ children }) {
  return <html lang="id" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body><PwaRegister>{children}</PwaRegister></body></html>;
}