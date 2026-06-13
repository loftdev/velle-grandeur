const placeholders = [
  { category: "Condo", location: "Metro Manila" },
  { category: "House and Lot", location: "Cebu" },
  { category: "Commercial Space", location: "Philippines" },
];

export default function ListingPlaceholder({ filtered = false }: { filtered?: boolean }) {
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="badge inline-block bg-[var(--accent-soft)] text-[var(--accent)]">
            Coming soon
          </p>
          <h2 className="mt-3 text-2xl font-semibold">Featured properties</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {filtered
              ? "No published listings match these filters. Try broadening your search."
              : "New listings are being prepared. Please check back soon."}
          </p>
        </div>
        <span className="text-sm text-neutral-500">0 available</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {placeholders.map((placeholder) => (
          <article
            key={placeholder.category}
            className="card overflow-hidden"
            aria-label={`${placeholder.category} listing coming soon`}
          >
            <div className="flex h-48 items-center justify-center bg-[var(--accent-soft)]">
              <div className="text-center text-[var(--accent)]">
                <p className="text-3xl" aria-hidden="true">
                  ◇
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em]">
                  Property preview
                </p>
              </div>
            </div>
            <div className="p-5">
              <div className="badge inline-block bg-[var(--accent-soft)] text-[var(--accent)]">
                {placeholder.category}
              </div>
              <h3 className="mt-3 text-lg font-semibold">Listing coming soon</h3>
              <p className="text-sm text-neutral-600">{placeholder.location}</p>
              <p className="mt-3 text-base font-semibold text-[var(--accent)]">
                Price upon publication
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
