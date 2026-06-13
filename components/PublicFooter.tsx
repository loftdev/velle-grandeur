import Link from "next/link";
import { getPublicCompany } from "../lib/api/company";

export default async function PublicFooter() {
  const company = await getPublicCompany();
  const name = company?.name ?? "VelleGrandeur";

  return (
    <footer className="mt-20 border-t border-[var(--line)] bg-[#fffdf9]/85">
      <div className="container grid gap-8 py-12 text-sm text-neutral-700 md:grid-cols-[1.4fr_0.6fr_1fr]">
        <div>
          <p className="text-lg font-semibold text-[var(--foreground)]">{name}</p>
          <p className="mt-3 max-w-md leading-6">
            {company?.about ??
              "Curated properties and attentive real estate guidance across the Philippines."}
          </p>
        </div>
        <div>
          <p className="font-semibold text-[var(--foreground)]">Explore</p>
          <div className="mt-3 grid gap-2">
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold text-[var(--foreground)]">Contact</p>
          <div className="mt-3 grid gap-2">
            {company?.email ? (
              <a href={`mailto:${company.email}`}>{company.email}</a>
            ) : (
              <span>Email available soon</span>
            )}
            {company?.phone ? (
              <a href={`tel:${company.phone.replace(/[^\d+]/g, "")}`}>
                {company.phone}
              </a>
            ) : (
              <span>Phone available soon</span>
            )}
            {company?.address ? <span>{company.address}</span> : null}
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--line)]">
        <p className="container py-5 text-xs text-neutral-500">
          © {new Date().getFullYear()} {name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
