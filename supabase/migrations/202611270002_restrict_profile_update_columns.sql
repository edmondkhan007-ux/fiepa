-- Restrict profile updates to user-editable fields.
-- Role changes must be performed through a trusted administrator workflow.
revoke update on table public.profiles from authenticated;
grant update (full_name, phone, preferred_language) on table public.profiles to authenticated;
