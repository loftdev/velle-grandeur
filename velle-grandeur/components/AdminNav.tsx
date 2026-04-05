"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

export default function AdminNav() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  return (
    <nav className="border-b border-[var(--line)] bg-white/80 backdrop-blur">
      <div className="container flex items-center justify-between py-4">
        <Link href="/admin" className="text-lg font-semibold">
          VelleGrandeur Admin
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/admin/company">Company</Link>
          <Link href="/admin/listings">Listings</Link>
          <Link href="/admin/inquiries">Inquiries</Link>
          <button
            type="button"
            className="text-[var(--accent)]"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
