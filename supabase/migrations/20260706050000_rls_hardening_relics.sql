-- ============================================================================
-- Hardening RLS sui relitti legacy (revisione Fable 2026-07-06)
-- admin_users e restaurant_settings erano le UNICHE tabelle pubbliche SENZA
-- RLS: coi GRANT default erano leggibili/scrivibili da qualunque authenticated.
-- Su un prodotto audit-grade è inaccettabile → RLS on, zero policy = deny-all
-- per i client (service_role continua a passare). Nessun flusso della nuova
-- app le usa; la rimozione definitiva dei relitti è decisione post-beta.
-- ============================================================================

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.admin_users IS
  'Relitto legacy — RLS deny-all dal 2026-07-06 (hardening). Candidata a rimozione post-beta.';
COMMENT ON TABLE public.restaurant_settings IS
  'Relitto legacy (app prenotazioni) — RLS deny-all dal 2026-07-06 (hardening). Candidata a rimozione post-beta.';
