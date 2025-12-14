-- Clean up any corrupted auth data from the previous bad migration
DELETE FROM auth.users WHERE email = 'admin@no2batabariyouthclub.com';