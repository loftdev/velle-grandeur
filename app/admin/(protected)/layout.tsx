import AdminNav from "../../../components/AdminNav";
import { getPublicCompany } from "../../../lib/api/company";
import { requireAdminSession } from "../../../lib/auth/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();
  const company = await getPublicCompany();

  return (
    <div className="admin-shell min-h-screen bg-[var(--background)]">
      <AdminNav
        companyName={company?.name ?? "VelleGrandeur"}
        logoUrl={company?.logo_url ?? null}
      />
      <main className="container py-12 sm:py-16">{children}</main>
    </div>
  );
}
