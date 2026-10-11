export default function manifest() {
  return {
    id: "/", name: "Goals Management", short_name: "Goals",
    description: "Wishlist dan daftar barang pribadi.", lang: "id",
    start_url: "/", scope: "/", display: "standalone",
    background_color: "#f9fafb", theme_color: "#3f75ff",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}