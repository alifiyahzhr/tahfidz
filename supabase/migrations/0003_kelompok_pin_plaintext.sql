-- Alongside pin_hash (used to verify teacher sign-in), keep a plaintext
-- copy so admins can view/share it from Settings. These PINs are a shared,
-- low-sensitivity class code (not a personal password), so this trade-off
-- is acceptable -- it's never exposed to anyone but authenticated admins.
alter table kelompok add column pin text;
