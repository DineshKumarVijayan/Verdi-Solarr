-- 0005: staff must choose their own password after the owner creates or resets it.
-- Additive only: existing admins keep their current password (MustChangePassword = 0).
ALTER TABLE AdminUsers ADD COLUMN MustChangePassword INTEGER NOT NULL DEFAULT 0 CHECK (MustChangePassword IN (0, 1));
ALTER TABLE AdminUsers ADD COLUMN PasswordChangedAt TEXT;
