"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { LoginIcon, UserPlusIcon } from "@solar-icons/react/linear";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/feedback";
import { request } from "@/components/hooks/request";

export function AuthForm({ setup = false }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (setup) {
        if (values.password !== values.confirmPassword)
          throw new Error("Konfirmasi password tidak cocok.");
        await request("/api/setup", { method: "POST", body: values });
      }
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if (result?.error)
        throw new Error(
          "Login gagal. Periksa email dan password. Setelah 8 percobaan gagal, tunggu 15 menit.",
        );
      router.replace("/products");
      router.refresh();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="form-stack">
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        required
        maxLength={254}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete={setup ? "new-password" : "current-password"}
        required
        minLength={setup ? 12 : undefined}
        maxLength={128}
        hint={setup ? "Minimal 12 karakter." : undefined}
      />
      {setup && (
        <Field
          label="Konfirmasi password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={128}
        />
      )}
      <ErrorMessage message={error} />
      <Button type="submit" disabled={busy}>
        {setup ? <UserPlusIcon size={18} /> : <LoginIcon size={18} />}
        {busy ? "Memproses..." : setup ? "Buat akun Developer" : "Masuk"}
      </Button>
    </form>
  );
}
