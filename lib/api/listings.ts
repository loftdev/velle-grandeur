import { getPublicStorageUrl } from "./storage";

export type ListingImageRow = {
  id: string;
  storage_path: string;
  sort_order: number;
};

export type ListingRow = {
  id: string;
  company_id: string;
  slug: string;
  category: string;
  status: string;
  title: string;
  description: string;
  price_cents: number;
  province: string;
  city: string | null;
  contact_phone: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  listing_images?: ListingImageRow[];
};

export function mapListingImages(images: ListingImageRow[] | null | undefined) {
  return (images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => ({
      id: image.id,
      storage_path: image.storage_path,
      sort_order: image.sort_order,
      image_url: getPublicStorageUrl("listing-images", image.storage_path),
    }));
}

export function mapListingForApi(listing: ListingRow) {
  return {
    id: listing.id,
    company_id: listing.company_id,
    slug: listing.slug,
    category: listing.category,
    status: listing.status,
    title: listing.title,
    description: listing.description,
    price_cents: listing.price_cents,
    province: listing.province,
    city: listing.city,
    contact_phone: listing.contact_phone,
    published_at: listing.published_at,
    created_at: listing.created_at,
    updated_at: listing.updated_at,
    images: mapListingImages(listing.listing_images),
  };
}
