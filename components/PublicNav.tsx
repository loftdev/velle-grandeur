import Link from "next/link";
import { getPublicCompany } from "../lib/api/company";

export default async function PublicNav() {
  const company = await getPublicCompany();
  const name = company?.name ?? "VelleGrandeur";

  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--line)] bg-[#fffdf9]/90 backdrop-blur">
      <div className="container flex flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          {company?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logo_url}
              alt=""
              className="h-9 w-9 rounded-full border border-[var(--line)] object-cover"
            />
          ) : (
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white"
              aria-hidden="true"
            >
              {name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="text-lg font-semibold tracking-wide sm:text-xl">
            {name}
          </span>
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-sm font-medium">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link
            href="/admin/login"
            className="rounded-full border border-[var(--accent)] px-4 py-2 text-[var(--accent)]"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
