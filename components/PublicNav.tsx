import Link from "next/link";

export default function PublicNav() {
  return (
    <nav className="border-b border-[var(--line)] bg-white/70 backdrop-blur">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="text-xl font-semibold tracking-wide">
          VelleGrandeur
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/admin/login" className="text-[var(--accent)]">
            Admin Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
