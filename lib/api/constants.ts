export const listingCategories = [
  "apartment",
  "commercial_space",
  "condo",
  "house_and_lot",
  "lot",
] as const;

export const listingStatuses = ["draft", "published", "sold"] as const;

export type ListingCategory = (typeof listingCategories)[number];
export type ListingStatus = (typeof listingStatuses)[number];

export const listingCategoryLabels: Record<ListingCategory, string> = {
  apartment: "Apartment",
  commercial_space: "Commercial Space",
  condo: "Condo",
  house_and_lot: "House and Lot",
  lot: "Lot",
};

export const listingStatusLabels: Record<ListingStatus, string> = {
  draft: "Draft",
  published: "Published",
  sold: "Sold",
};

export const inquiryStatuses = ["new", "contacted", "closed"] as const;

export const MAX_LISTING_LIMIT = 50;
export const DEFAULT_LISTING_LIMIT = 12;
export const MAX_LISTING_IMAGES = 10;
export const MAX_LISTING_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
