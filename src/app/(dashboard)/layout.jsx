import { redirect } from "next/navigation";
import { currentUser } from "@/data/auth/access";
import { Navigation } from "@/components/shell/navigation";
export const dynamic = "force-dynamic";
export default async function DashboardLayout({ children }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  return (
    <>
      <a href="#main" className="skip-link">
        Langsung ke konten
      </a>
      <Navigation user={user} />
      <main id="main" className="section-inner main-content">
        {children}
      </main>
      <footer className="section-inner app-footer">
        <span>Wishlist & Stuff Manager</span>
        <span className="account-label">
          {user.email}{" "}
          <span className="badge">
            {user.role === "DEVELOPER" ? "Developer" : "Admin"}
          </span>
        </span>
      </footer>
    </>
  );
}
