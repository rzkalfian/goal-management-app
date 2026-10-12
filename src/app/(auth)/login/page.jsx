import { redirect } from "next/navigation";
import { currentUser } from "@/data/auth/access";
import { userCount } from "@/data/repositories/users";
import { AuthScreen } from "@/components/forms/auth-screen";
export const dynamic = "force-dynamic";
export const metadata = { title: "Masuk" };
export default async function Login() {
  if (!(await userCount())) redirect("/setup");
  if (await currentUser()) redirect("/products");
  return <AuthScreen />;
}
