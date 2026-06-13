ALTER TABLE company
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS business_hours text;

ALTER TABLE company
  DROP CONSTRAINT IF EXISTS company_latitude_range,
  ADD CONSTRAINT company_latitude_range
    CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90);

ALTER TABLE company
  DROP CONSTRAINT IF EXISTS company_longitude_range,
  ADD CONSTRAINT company_longitude_range
    CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180);

UPDATE company
SET
  address = 'Poblacion, Claveria, Misamis Oriental, Philippines',
  latitude = 8.611484,
  longitude = 124.894067
WHERE singleton_key = true;
