INSERT INTO company (name, phone, email, address, about)
VALUES (
  'VelleGrandeur',
  '+63 900 000 0000',
  'info@vellegrandeur.com',
  'Philippines',
  'Luxury residences and curated investment properties across the Philippines.'
)
ON CONFLICT (singleton_key) DO NOTHING;

-- Replace with an existing auth.users UUID from Supabase Auth.
-- INSERT INTO admin_users (user_id) VALUES ('00000000-0000-0000-0000-000000000000')
-- ON CONFLICT (user_id) DO NOTHING;
