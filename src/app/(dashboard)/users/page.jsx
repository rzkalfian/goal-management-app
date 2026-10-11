import { redirect } from "next/navigation";
import { currentUser } from "@/data/auth/access";
import { UserManager } from "@/components/users/user-manager";
export const metadata = { title: "Pengguna" };
export default async function Users() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return <UserManager currentUser={user} />;
}