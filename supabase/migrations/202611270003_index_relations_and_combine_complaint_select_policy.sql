
create index if not exists complaint_evidence_complaint_idx on public.complaint_evidence (complaint_id);
create index if not exists complaint_evidence_uploader_idx on public.complaint_evidence (uploaded_by);
create index if not exists complaints_assigned_to_idx on public.complaints (assigned_to);
create index if not exists complaints_property_idx on public.complaints (property_id);
create index if not exists disputes_complaint_idx on public.disputes (complaint_id);
create index if not exists disputes_opened_by_idx on public.disputes (opened_by);
create index if not exists disputes_other_party_idx on public.disputes (other_party_id);
create index if not exists rent_assessment_property_idx on public.rent_assessment_requests (property_id);
create index if not exists rent_assessment_submitter_idx on public.rent_assessment_requests (submitted_by);
create index if not exists rent_receipts_payer_idx on public.rent_receipts (payer_id);
create index if not exists tenancies_property_idx on public.tenancies (property_id);
drop policy if exists "Assigned moderators view complaints" on public.complaints;
drop policy if exists "Reporters view their complaints" on public.complaints;
create policy "Participants view complaints" on public.complaints for select to authenticated
using (reporter_id = (select auth.uid()) or assigned_to = (select auth.uid()));
