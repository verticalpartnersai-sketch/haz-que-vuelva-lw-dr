-- Supabase grants broad API privileges to anon/authenticated by default.
-- RLS remains the authorization boundary, while these grants reduce the blast
-- radius of a future policy mistake and keep write access explicit.

revoke usage on schema public from public, anon;
revoke all privileges on all tables in schema public from anon;
revoke all privileges on all sequences in schema public from anon;
revoke execute on all functions in schema public from anon;
revoke execute on all functions in schema public from public;

revoke all privileges on all tables in schema public from authenticated;
revoke all privileges on all sequences in schema public from authenticated;
revoke execute on all functions in schema public from authenticated;

grant usage on schema public to authenticated;

grant select on table
  public.profiles,
  public.products,
  public.external_offers,
  public.purchases,
  public.purchase_items,
  public.access_grants,
  public.access_revocations,
  public.effective_entitlements,
  public.incoming_events,
  public.outbox_jobs,
  public.audit_log,
  public.content_items,
  public.content_files,
  public.watermarked_files,
  public.download_events,
  public.ai_cases,
  public.ai_conversations,
  public.ai_messages,
  public.ai_credit_lots,
  public.ai_generations,
  public.ai_documents,
  public.ai_chunks,
  public.ai_prompt_versions,
  public.consent_records,
  public.ai_case_inputs,
  public.privacy_requests,
  public.member_reading_progress,
  public.email_delivery_events,
  public.email_suppressions
to authenticated;

grant insert on table
  public.consent_records,
  public.privacy_requests
to authenticated;

grant update (display_name) on table public.profiles to authenticated;

grant execute on function public.is_admin()
to authenticated;
grant execute on function public.reset_ai_case(uuid)
to authenticated;
grant execute on function public.set_member_reading_progress(text, integer)
to authenticated;
grant execute on function public.grant_manual_access_with_reauthentication(
  uuid, text, text, text
) to authenticated;
grant execute on function public.revoke_access_grant_with_reauthentication(
  uuid, text, text
) to authenticated;
grant execute on function public.transfer_purchase_with_reauthentication(
  uuid, uuid, text, text
) to authenticated;
grant execute on function public.create_ai_prompt_draft_with_reauthentication(
  text, text
) to authenticated;
grant execute on function public.publish_ai_prompt_with_reauthentication(
  uuid, text
) to authenticated;
grant execute on function public.publish_content_pdf_with_reauthentication(
  text, text, text, text, text, bigint, text, text
) to authenticated;
grant execute on function public.update_product_with_reauthentication(
  text, text, text, boolean, integer, text
) to authenticated;
grant execute on function public.upsert_external_offer_with_reauthentication(
  text, text, text, text, boolean, text
) to authenticated;
grant execute on function public.queue_member_invitation_with_reauthentication(
  uuid, text, uuid, text
) to authenticated;

alter default privileges for role postgres in schema public
  revoke all privileges on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all privileges on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;
