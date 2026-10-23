import { AuthForm } from "./auth-form";
import { ThemeToggle } from "@/components/shell/theme-toggle";
export function AuthScreen({ setup = false }) {
  return (
    <main className="auth-page">
      <div className="auth-brand">
        <span className="brand">
          Goals<span>Management</span>
        </span>
        <ThemeToggle />
      </div>
      <section className="auth-form-area">
        <h1>{setup ? "Siapkan ruang Anda" : "Masuk ke ruang Anda"}</h1>
        <p>
          {setup
            ? "Buat akun Developer pertama untuk mulai mengelola barang."
            : "Gunakan akun yang sudah dibuat oleh Developer."}
        </p>
        <AuthForm setup={setup} />
        {!setup && (
          <p>
            Coba demo: <strong>demo@goals.local</strong> /{" "}
            <strong>demo-goals</strong>. Data contoh bersifat statis dan
            terpisah dari database.
          </p>
        )}
      </section>
      <footer>Wishlist & Stuff Manager</footer>
    </main>
  );
}
