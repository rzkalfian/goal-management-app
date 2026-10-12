import { Tag, BookOpen, Shirt, Laptop, Gamepad2, House, Utensils, Dumbbell, Car, Wrench, Smartphone, Gift, Headphones, Camera, Baby, Pill } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";

// shortcut: ikon dipilih dari kata kunci nama kategori; tambah baris jika kategori baru butuh ikon sendiri
const ICONS = [
  [/buku|book|novel|komik/i, BookOpen], [/baju|pakaian|fashion|sepatu|tas|kaos/i, Shirt],
  [/laptop|komputer|elektronik|pc/i, Laptop], [/hp|ponsel|smartphone|gadget/i, Smartphone],
  [/game|gim|mainan/i, Gamepad2], [/rumah|furnitur|dapur|perabot|dekor/i, House],
  [/makan|minum|snack|kuliner|food/i, Utensils], [/olahraga|gym|fitness|sport/i, Dumbbell],
  [/mobil|motor|kendaraan|otomotif/i, Car], [/alat|tools|perkakas/i, Wrench],
  [/audio|musik|headset|speaker/i, Headphones], [/kamera|foto/i, Camera],
  [/bayi|anak|baby/i, Baby], [/kesehatan|obat|vitamin|skincare|kecantikan/i, Pill],
  [/hadiah|kado|gift/i, Gift],
];

export function CategoryIcon({ name = "", icon, ...props }) {
  if (icon) return <DynamicIcon name={icon} fallback={Tag} aria-hidden="true" {...props} />;
  const Icon = ICONS.find(([pattern]) => pattern.test(name))?.[1] || Tag;
  return <Icon aria-hidden="true" {...props} />;
}
