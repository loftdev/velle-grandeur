import AdminNav from "../../../components/AdminNav";
import { requireAdminSession } from "../../../lib/auth/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();

  return (
    <div className="admin-shell min-h-screen bg-[var(--background)]">
      <AdminNav />
      <main className="container py-12 sm:py-16">{children}</main>
    </div>
  );
}
