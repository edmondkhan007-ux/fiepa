-- FiePa security hardening: prevent role self-promotion and limit API privileges.
begin;

revoke all privileges on all tables in schema public from anon;
revoke all privileges on all tables in schema public from authenticated;
grant usage on schema public to authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, phone, preferred_language, updated_at) on public.profiles to authenticated;
grant select, insert, update, delete on public.properties to authenticated;
grant select on public.tenancies to authenticated;
grant select, insert on public.rent_receipts to authenticated;
grant select, insert on public.complaints to authenticated;
grant update (category, description, property_id, is_anonymous_to_property_owner, updated_at) on public.complaints to authenticated;
grant select, insert on public.complaint_evidence to authenticated;
grant select, insert on public.disputes to authenticated;
grant select, insert on public.rent_assessment_requests to authenticated;

drop policy if exists "Profiles are viewable by their owner" on public.profiles;
create policy "Profiles are viewable by their owner" on public.profiles for select to authenticated
using (id = (select auth.uid()));

drop policy if exists "Users update their own basic profile" on public.profiles;
create policy "Users update their own basic profile" on public.profiles for update to authenticated
using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "Owners manage their properties" on public.properties;
create policy "Owners manage their properties" on public.properties for all to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

drop policy if exists "Tenancy parties can view tenancy" on public.tenancies;
create policy "Tenancy parties can view tenancy" on public.tenancies for select to authenticated
using (tenant_id = (select auth.uid()) or landlord_id = (select auth.uid()));
drop policy if exists "Landlords create tenancies for their properties" on public.tenancies;

drop policy if exists "Tenancy parties view receipts" on public.rent_receipts;
create policy "Tenancy parties view receipts" on public.rent_receipts for select to authenticated
using (exists (select 1 from public.tenancies t where t.id = rent_receipts.tenancy_id
and (t.tenant_id = (select auth.uid()) or t.landlord_id = (select auth.uid()))));

drop policy if exists "Payers add their receipts" on public.rent_receipts;
create policy "Payers add their receipts" on public.rent_receipts for insert to authenticated
with check (payer_id = (select auth.uid()) and exists (
select 1 from public.tenancies t where t.id = rent_receipts.tenancy_id
and (t.tenant_id = (select auth.uid()) or t.landlord_id = (select auth.uid()))));

drop policy if exists "Users create complaints" on public.complaints;
create policy "Users create complaints" on public.complaints for insert to authenticated
with check (reporter_id = (select auth.uid()) and status = 'submitted' and assigned_to is null);

drop policy if exists "Reporters view their complaints" on public.complaints;
create policy "Reporters view their complaints" on public.complaints for select to authenticated
using (reporter_id = (select auth.uid()));

drop policy if exists "Assigned moderators view complaints" on public.complaints;
create policy "Assigned moderators view complaints" on public.complaints for select to authenticated
using (assigned_to = (select auth.uid()));

drop policy if exists "Reporters update own submitted complaints" on public.complaints;
create policy "Reporters update own submitted complaints" on public.complaints for update to authenticated
using (reporter_id = (select auth.uid()) and status = 'submitted')
with check (reporter_id = (select auth.uid()) and status = 'submitted' and assigned_to is null);

drop policy if exists "Evidence visible to complaint reporter" on public.complaint_evidence;
create policy "Evidence visible to complaint reporter" on public.complaint_evidence for select to authenticated
using (exists (select 1 from public.complaints c where c.id = complaint_evidence.complaint_id
and c.reporter_id = (select auth.uid())));

drop policy if exists "Reporter uploads evidence" on public.complaint_evidence;
create policy "Reporter uploads evidence" on public.complaint_evidence for insert to authenticated
with check (uploaded_by = (select auth.uid()) and exists (
select 1 from public.complaints c where c.id = complaint_evidence.complaint_id
and c.reporter_id = (select auth.uid())));

drop policy if exists "Dispute participants view disputes" on public.disputes;
create policy "Dispute participants view disputes" on public.disputes for select to authenticated
using (opened_by = (select auth.uid()) or other_party_id = (select auth.uid()));

drop policy if exists "Users open disputes" on public.disputes;
create policy "Users open disputes" on public.disputes for insert to authenticated
with check (opened_by = (select auth.uid()) and status = 'open' and resolution_note is null);
drop policy if exists "Dispute opener can update open dispute" on public.disputes;

drop policy if exists "Landlords manage own assessment requests" on public.rent_assessment_requests;
create policy "Landlords manage own assessment requests" on public.rent_assessment_requests for select to authenticated
using (submitted_by = (select auth.uid()));

create policy "Users create draft assessment requests" on public.rent_assessment_requests for insert to authenticated
with check (submitted_by = (select auth.uid()) and status = 'draft'
and official_reference is null and official_outcome_note is null
and exists (select 1 from public.properties p where p.id = rent_assessment_requests.property_id
and p.owner_id = (select auth.uid())));

commit;
