import { redirect } from "next/navigation";
import { userCount } from "@/data/repositories/users";
import { AuthScreen } from "@/components/forms/auth-screen";
import { initialSetupAllowed } from "@/core/use-cases/setup";
export const dynamic = "force-dynamic";
export const metadata = { title: "Setup" };
export default async function Setup() {
  if (await userCount()) redirect("/login");
  if (!initialSetupAllowed())
    return (
      <main className="section-inner data-state">
        <h1>Aplikasi belum diaktifkan</h1>
        <p>Hubungi pengelola untuk menyiapkan akun pertama.</p>
      </main>
    );
  return <AuthScreen setup />;
}
