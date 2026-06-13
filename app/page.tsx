import Link from "next/link";
import ListingCard from "../components/ListingCard";
import type { ListingSummary } from "../components/ListingCard";
import ListingPlaceholder from "../components/ListingPlaceholder";
import PublicFooter from "../components/PublicFooter";
import PublicNav from "../components/PublicNav";
import { getPublicCompany } from "../lib/api/company";
import { getBaseUrl } from "../lib/api/url";

type SearchParams = {
  category?: string;
  province?: string;
  city?: string;
};

async function fetchListings(params: SearchParams) {
  const baseUrl = await getBaseUrl();
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.province) search.set("province", params.province);
  if (params.city) search.set("city", params.city);
  search.set("limit", "12");

  const res = await fetch(`${baseUrl}/api/public/listings?${search.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) return { items: [] as ListingSummary[] };
  return (await res.json()) as { items: ListingSummary[] };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [company, listings] = await Promise.all([
    getPublicCompany(),
    fetchListings(params),
  ]);

  const items = listings?.items ?? [];
  const hasFilters = Boolean(params.category || params.province || params.city);
  const categories = [
    "apartment",
    "commercial_space",
    "condo",
    "house_and_lot",
    "lot",
  ];

  return (
    <div>
      <PublicNav />
      <main>
        <section className="container grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="max-w-3xl">
            <p className="badge inline-block bg-[var(--accent-soft)] text-[var(--accent)]">
              Curated Philippine properties
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
              Find a property that feels considered, connected, and distinctly
              yours.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-700">
              {company?.about ??
                "Luxury residences, curated for clients who value calm design and prime locations."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#properties"
                className="button bg-[var(--accent)] text-white"
              >
                Browse properties
              </a>
              <Link
                href="/contact"
                className="button border border-[var(--line)] bg-white"
              >
                Talk to our team
              </Link>
            </div>
          </div>
          <div className="card p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Property search
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Where would you like to live?</h2>
            <form className="mt-6 grid gap-4" method="get">
              <label className="grid gap-2 text-sm font-medium">
                Category
                <select
                  name="category"
                  defaultValue={params.category ?? ""}
                  className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
                >
                  <option value="">All categories</option>
                  <option value="apartment">Apartment</option>
                  <option value="commercial_space">Commercial Space</option>
                  <option value="condo">Condo</option>
                  <option value="house_and_lot">House and Lot</option>
                  <option value="lot">Lot</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Province
                <input
                  name="province"
                  defaultValue={params.province ?? ""}
                  placeholder="Cebu"
                  className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                City
                <input
                  name="city"
                  defaultValue={params.city ?? ""}
                  placeholder="Cebu City"
                  className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
                />
              </label>
              <button
                className="button bg-[var(--accent)] text-white"
                type="submit"
              >
                Search listings
              </button>
              {hasFilters ? (
                <Link href="/" className="text-center text-sm text-neutral-600 underline">
                  Clear filters
                </Link>
              ) : null}
            </form>
          </div>
        </section>

        <section className="border-y border-[var(--line)] bg-white/55">
          <div className="container grid gap-8 py-16 sm:py-20 md:grid-cols-3">
            {[
              ["Curated selection", "Properties chosen for location, quality, and lasting appeal."],
              ["Local perspective", "Guidance grounded in Philippine communities and property markets."],
              ["Personal service", "A thoughtful, responsive experience from discovery to viewing."],
            ].map(([title, description], index) => (
              <article key={title} className="p-2">
                <p className="text-sm font-semibold text-[var(--accent)]">
                  0{index + 1}
                </p>
                <h2 className="mt-3 text-xl font-semibold">{title}</h2>
                <p className="mt-2 leading-7 text-neutral-600">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="properties"
          className="container scroll-mt-28 py-16 sm:py-20"
        >
          <div className="space-y-10">
            {items.length === 0 ? (
              <ListingPlaceholder filtered={hasFilters} />
            ) : (
              categories.map((category) => {
                const categoryItems = items.filter(
                  (listing) => listing.category === category,
                );
                if (!categoryItems.length) return null;
                return (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">
                        {category.replace(/_/g, " ")}
                      </h2>
                      <span className="text-sm text-neutral-500">
                        {categoryItems.length} available
                      </span>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {categoryItems.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="container pb-8">
          <div className="overflow-hidden rounded-[28px] bg-[var(--foreground)] px-6 py-12 text-white sm:px-10 lg:flex lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d9b58f]">
                Start a conversation
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold">
                Looking for something specific? Let us help narrow the search.
              </h2>
            </div>
            <Link
              href="/contact"
              className="button mt-6 inline-block bg-white text-[var(--foreground)] lg:mt-0"
            >
              Contact {company?.name ?? "our team"}
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
