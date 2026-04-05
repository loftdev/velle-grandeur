import ListingCard from "../components/ListingCard";
import type { ListingSummary } from "../components/ListingCard";
import PublicFooter from "../components/PublicFooter";
import PublicNav from "../components/PublicNav";
import { getBaseUrl } from "../lib/api/url";

type SearchParams = {
  category?: string;
  province?: string;
  city?: string;
};

async function fetchCompany() {
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/public/company`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as { name: string; about: string | null };
}

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
    fetchCompany(),
    fetchListings(params),
  ]);

  const items = listings?.items ?? [];
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
      <main className="container pb-16 pt-10">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="badge bg-[var(--accent-soft)] text-[var(--accent)]">
              {company?.name ?? "VelleGrandeur"}
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight lg:text-5xl">
              Discover refined spaces and exceptional addresses across the
              Philippines.
            </h1>
            <p className="mt-4 text-lg text-neutral-700">
              {company?.about ??
                "Luxury residences, curated for clients who value calm design and prime locations."}
            </p>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold">Find your next property</h2>
            <form className="mt-4 grid gap-4" method="get">
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
            </form>
          </div>
        </section>

        <section className="mt-14 space-y-10">
          {categories.map((category) => {
            const categoryItems = items.filter((listing) => listing.category === category);
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
          })}
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
