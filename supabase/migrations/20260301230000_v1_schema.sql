create extension if not exists pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_category') THEN
    CREATE TYPE listing_category AS ENUM (
      'apartment',
      'commercial_space',
      'condo',
      'house_and_lot',
      'lot'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_status') THEN
    CREATE TYPE listing_status AS ENUM ('draft', 'published', 'sold');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inquiry_status') THEN
    CREATE TYPE inquiry_status AS ENUM ('new', 'contacted', 'closed');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS company (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_key boolean NOT NULL DEFAULT true UNIQUE,
  name text NOT NULL,
  logo_path text,
  phone text,
  email text,
  address text,
  about text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES company(id),
  category listing_category NOT NULL,
  status listing_status NOT NULL DEFAULT 'draft',
  title text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL,
  price_cents bigint NOT NULL CHECK (price_cents >= 0),
  province text NOT NULL,
  city text,
  contact_phone text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, slug)
);

CREATE TABLE IF NOT EXISTS listing_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES company(id),
  listing_id uuid NOT NULL REFERENCES listings(id),
  name text NOT NULL,
  email text,
  phone text,
  message text NOT NULL,
  status inquiry_status NOT NULL DEFAULT 'new',
  ip_hash text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS listings_company_status_published_idx
  ON listings(company_id, status, published_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS listings_category_location_idx
  ON listings(category, province, city);
CREATE INDEX IF NOT EXISTS listing_images_listing_sort_idx
  ON listing_images(listing_id, sort_order);
CREATE INDEX IF NOT EXISTS inquiries_listing_created_idx
  ON inquiries(listing_id, created_at DESC);
CREATE INDEX IF NOT EXISTS inquiries_ip_created_idx
  ON inquiries(ip_hash, created_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS company_set_updated_at ON company;
CREATE TRIGGER company_set_updated_at
BEFORE UPDATE ON company
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS listings_set_updated_at ON listings;
CREATE TRIGGER listings_set_updated_at
BEFORE UPDATE ON listings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS inquiries_set_updated_at ON inquiries;
CREATE TRIGGER inquiries_set_updated_at
BEFORE UPDATE ON inquiries
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

ALTER TABLE company ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DROP POLICY IF EXISTS company_public_read ON company;
CREATE POLICY company_public_read
  ON company
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS company_admin_manage ON company;
CREATE POLICY company_admin_manage
  ON company
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS admin_users_admin_read ON admin_users;
CREATE POLICY admin_users_admin_read
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS admin_users_admin_manage ON admin_users;
CREATE POLICY admin_users_admin_manage
  ON admin_users
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS listings_public_read ON listings;
CREATE POLICY listings_public_read
  ON listings
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS listings_admin_manage ON listings;
CREATE POLICY listings_admin_manage
  ON listings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS listing_images_public_read ON listing_images;
CREATE POLICY listing_images_public_read
  ON listing_images
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM listings l
      WHERE l.id = listing_images.listing_id
      AND l.status = 'published'
    )
  );

DROP POLICY IF EXISTS listing_images_admin_manage ON listing_images;
CREATE POLICY listing_images_admin_manage
  ON listing_images
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS inquiries_public_insert ON inquiries;
CREATE POLICY inquiries_public_insert
  ON inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM listings l
      WHERE l.id = inquiries.listing_id
      AND l.company_id = inquiries.company_id
      AND l.status = 'published'
    )
  );

DROP POLICY IF EXISTS inquiries_admin_read ON inquiries;
CREATE POLICY inquiries_admin_read
  ON inquiries
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS inquiries_admin_update ON inquiries;
CREATE POLICY inquiries_admin_update
  ON inquiries
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS inquiries_admin_delete ON inquiries;
CREATE POLICY inquiries_admin_delete
  ON inquiries
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('company-assets', 'company-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS storage_listing_images_public_read ON storage.objects;
CREATE POLICY storage_listing_images_public_read
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'listing-images');

DROP POLICY IF EXISTS storage_company_assets_public_read ON storage.objects;
CREATE POLICY storage_company_assets_public_read
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'company-assets');

DROP POLICY IF EXISTS storage_listing_images_admin_insert ON storage.objects;
CREATE POLICY storage_listing_images_admin_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'listing-images' AND public.is_admin());

DROP POLICY IF EXISTS storage_listing_images_admin_update ON storage.objects;
CREATE POLICY storage_listing_images_admin_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'listing-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'listing-images' AND public.is_admin());

DROP POLICY IF EXISTS storage_listing_images_admin_delete ON storage.objects;
CREATE POLICY storage_listing_images_admin_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'listing-images' AND public.is_admin());

DROP POLICY IF EXISTS storage_company_assets_admin_insert ON storage.objects;
CREATE POLICY storage_company_assets_admin_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'company-assets' AND public.is_admin());

DROP POLICY IF EXISTS storage_company_assets_admin_update ON storage.objects;
CREATE POLICY storage_company_assets_admin_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'company-assets' AND public.is_admin())
  WITH CHECK (bucket_id = 'company-assets' AND public.is_admin());

DROP POLICY IF EXISTS storage_company_assets_admin_delete ON storage.objects;
CREATE POLICY storage_company_assets_admin_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'company-assets' AND public.is_admin());
