import PublicFooter from "../../../components/PublicFooter";
import PublicNav from "../../../components/PublicNav";
import { getBaseUrl } from "../../../lib/api/url";
import { redirect } from "next/navigation";

type ListingDetail = {
  id: string;
  slug: string;
  category: string;
  title: string;
  description: string;
  price_cents: number;
  province: string;
  city: string | null;
  images: { id: string; image_url: string }[];
};

async function fetchListing(slugOrId: string) {
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/public/listings/${slugOrId}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as ListingDetail;
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ slugOrId: string }>;
}) {
  const { slugOrId } = await params;
  const listing = await fetchListing(slugOrId);

  if (!listing) {
    return (
      <div>
        <PublicNav />
        <main className="container py-16">
          <div className="card p-10 text-center">
            <h1 className="text-2xl font-semibold">Listing not found</h1>
            <p className="mt-2 text-neutral-600">
              The listing may have been removed or unpublished.
            </p>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const price = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(listing.price_cents / 100);

  const canonical = `${listing.slug}-${listing.id}`;
  if (slugOrId !== canonical) {
    redirect(`/listings/${canonical}`);
  }

  return (
    <div>
      <PublicNav />
      <main className="container py-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="card overflow-hidden">
              <div className="grid gap-2">
                {listing.images?.length ? (
                  listing.images.map((image) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={image.id}
                      src={image.image_url}
                      alt={listing.title}
                      className="h-64 w-full object-cover"
                    />
                  ))
                ) : (
                  <div className="flex h-64 items-center justify-center text-sm text-neutral-500">
                    No images available
                  </div>
                )}
              </div>
            </div>
            <div className="card p-6">
              <h1 className="text-3xl font-semibold">{listing.title}</h1>
              <p className="mt-2 text-sm uppercase tracking-widest text-neutral-500">
                {listing.category.replace(/_/g, " ")}
              </p>
              <p className="mt-4 text-2xl font-semibold text-[var(--accent)]">
                {price}
              </p>
              <p className="mt-4 text-neutral-700">{listing.description}</p>
              <p className="mt-6 text-sm text-neutral-600">
                {listing.city ? `${listing.city}, ` : ""}
                {listing.province}
              </p>
            </div>
          </div>

          <div className="card h-fit p-6">
            <h2 className="text-xl font-semibold">Inquire about this listing</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Share your details and we will contact you shortly.
            </p>
            <form
              className="mt-4 grid gap-4"
              action="/api/public/inquiries"
              method="post"
            >
              <input type="hidden" name="listing_id" value={listing.id} />
              <label className="grid gap-2 text-sm font-medium">
                Name
                <input
                  name="name"
                  required
                  className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Email
                <input
                  name="email"
                  type="email"
                  className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Phone
                <input
                  name="phone"
                  className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Message
                <textarea
                  name="message"
                  required
                  rows={4}
                  className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
                />
              </label>
              <input type="text" name="website" className="hidden" tabIndex={-1} />
              <button className="button bg-[var(--accent)] text-white" type="submit">
                Send inquiry
              </button>
            </form>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
