import Link from "next/link";

export type ListingSummary = {
  id: string;
  slug: string;
  title: string;
  price_cents: number;
  province: string;
  city: string | null;
  category: string;
  images: { id: string; image_url: string; sort_order: number }[];
};

function formatPrice(priceCents: number) {
  const price = priceCents / 100;
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ListingCard({ listing }: { listing: ListingSummary }) {
  const image = listing.images?.[0]?.image_url;

  return (
    <Link
      href={`/listings/${listing.slug}-${listing.id}`}
      className="group card overflow-hidden transition-shadow"
    >
      <div className="h-48 w-full bg-[var(--accent-soft)]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">
            No image available
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="badge bg-[var(--accent-soft)] text-[var(--accent)]">
          {listing.category.replace(/_/g, " ")}
        </div>
        <h3 className="mt-3 text-lg font-semibold">{listing.title}</h3>
        <p className="text-sm text-neutral-600">
          {listing.city ? `${listing.city}, ` : ""}
          {listing.province}
        </p>
        <p className="mt-3 text-base font-semibold text-[var(--accent)]">
          {formatPrice(listing.price_cents)}
        </p>
      </div>
    </Link>
  );
}
