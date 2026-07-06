-- ============================================================================
-- companies snella per la beta (dec. 4) + onboarding server-side (mappa Regia)
-- Solo P.IVA (vat_number) + ragione sociale (= name esistente).
-- NIENTE license_number/gestione licenza in beta.
-- ============================================================================

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS vat_number varchar(32),
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.companies.vat_number IS
  'Partita IVA (dec. 4: companies snella — solo P.IVA + ragione sociale in beta)';
COMMENT ON COLUMN public.companies.onboarding_completed IS
  'Stato onboarding server-side (mappa Regia): true quando i 7 step sono completati';
