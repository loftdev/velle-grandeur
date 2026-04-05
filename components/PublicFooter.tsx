export default function PublicFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--line)] bg-white/70 backdrop-blur">
      <div className="container py-10 text-sm text-neutral-700">
        <div className="flex flex-col gap-2">
          <p className="font-semibold">VelleGrandeur Realty</p>
          <p>Luxury properties across the Philippines.</p>
          <p>info@vellegrandeur.com · +63 900 000 0000</p>
        </div>
        <p className="mt-6 text-xs text-neutral-500">
          © 2026 VelleGrandeur. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
