import { redirect } from "next/navigation";
import { userCount } from "@/data/repositories/users";
export const dynamic = "force-dynamic";
export default async function Home() { redirect(await userCount() ? "/products" : "/setup"); }