export const listingCategories = [
  "apartment",
  "commercial_space",
  "condo",
  "house_and_lot",
  "lot",
] as const;

export const listingStatuses = ["draft", "published", "sold"] as const;

export const inquiryStatuses = ["new", "contacted", "closed"] as const;

export const MAX_LISTING_LIMIT = 50;
export const DEFAULT_LISTING_LIMIT = 12;
