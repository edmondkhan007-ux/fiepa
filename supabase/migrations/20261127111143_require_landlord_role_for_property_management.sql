-- Only approved landlords and administrators can create or manage property listings.
drop policy if exists "Owners manage their properties" on public.properties;
create policy "Landlords manage their properties"
on public.properties for all to authenticated
using (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('landlord', 'admin')
  )
)
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('landlord', 'admin')
  )
);
