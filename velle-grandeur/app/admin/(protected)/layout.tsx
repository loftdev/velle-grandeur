import AdminNav from "../../../components/AdminNav";
import { requireAdminSession } from "../../../lib/auth/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AdminNav />
      <div className="container py-10">{children}</div>
    </div>
  );
}
