import Link from "next/link";
import ListingImageCarousel from "./ListingImageCarousel";
import {
  listingCategoryLabels,
  type ListingCategory,
} from "../lib/api/constants";

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
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export default function ListingCard({ listing }: { listing: ListingSummary }) {
  const href = `/listings/${listing.slug}-${listing.id}`;
  const categoryLabel =
    listingCategoryLabels[listing.category as ListingCategory] ??
    listing.category.replace(/_/g, " ");

  return (
    <article className="card overflow-hidden transition-shadow">
      <ListingImageCarousel
        images={listing.images ?? []}
        listingHref={href}
        title={listing.title}
      />
      <Link href={href} className="block p-5 hover:bg-white/45">
        <div className="badge bg-[var(--accent-soft)] text-[var(--accent)]">
          {categoryLabel}
        </div>
        <h3 className="mt-3 text-lg font-semibold">{listing.title}</h3>
        <p className="text-sm text-neutral-600">
          {listing.city ? `${listing.city}, ` : ""}
          {listing.province}
        </p>
        <p className="mt-3 text-base font-semibold text-[var(--accent)]">
          {formatPrice(listing.price_cents)}
        </p>
      </Link>
    </article>
  );
}
