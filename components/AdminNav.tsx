"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/company", label: "Company" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/inquiries", label: "Inquiries" },
];

export default function AdminNav({
  companyName,
  logoUrl,
}: {
  companyName: string;
  logoUrl: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--line)] bg-[#fffdf9]/95 backdrop-blur">
      <div className="container py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/admin" className="flex min-w-0 items-center gap-3">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full border border-[var(--line)] bg-white object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] font-semibold text-white">
                {companyName.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-base font-semibold sm:text-lg">
                {companyName}
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                Admin
              </span>
            </span>
          </Link>
          <button
            type="button"
            className="button shrink-0 border border-[var(--line)] bg-white px-4 py-2 text-sm text-[var(--accent)]"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 text-sm font-medium sm:absolute sm:left-1/2 sm:top-1/2 sm:mt-0 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:overflow-visible sm:pb-0">
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 rounded-full px-4 py-2 transition ${
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-neutral-600 hover:bg-white hover:text-[var(--foreground)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
