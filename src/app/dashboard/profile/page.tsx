"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string;
  phone: string | null;
  preferred_language: string;
  role: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    full_name: "", phone: "", preferred_language: "en", role: "tenant",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/"; return; }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name,phone,preferred_language,role")
        .eq("id", user.id)
        .single();

      if (error) setMessage(error.message);
      else if (data) setProfile({
        full_name: data.full_name ?? "",
        phone: data.phone ?? "",
        preferred_language: data.preferred_language ?? "en",
        role: data.role ?? "tenant",
      });
      setLoading(false);
    })();
  }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/"; return; }

    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name.trim(),
      phone: profile.phone?.trim() || null,
      preferred_language: profile.preferred_language,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);

    setMessage(error ? error.message : "Your profile has been updated.");
    setSaving(false);
  }

  if (loading) return <main className="shell"><p className="muted">Loading profile…</p></main>;

  return (
    <main className="shell">
      <nav className="nav">
        <a className="brand" href="/">FiePa.</a>
        <a className="btn alt" href="/dashboard">Back to dashboard</a>
      </nav>
      <h1>My profile</h1>
      <p className="muted">Keep your contact details up to date for tenancy-related communication.</p>
      <form className="panel" onSubmit={save}>
        <label htmlFor="full_name">Full name</label>
        <input id="full_name" required maxLength={120} value={profile.full_name}
          onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
        <label htmlFor="phone">Phone number</label>
        <input id="phone" type="tel" maxLength={25} value={profile.phone ?? ""}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="e.g. 024 000 0000" />
        <label htmlFor="preferred_language">Preferred language</label>
        <select id="preferred_language" value={profile.preferred_language}
          onChange={(e) => setProfile({ ...profile, preferred_language: e.target.value })}>
          <option value="en">English</option>
          <option value="tw">Twi</option>
          <option value="ga">Ga</option>
          <option value="ee">Ewe</option>
          <option value="dag">Dagbani</option>
          <option value="other">Other</option>
        </select>
        <label>Account type</label>
        <input value={profile.role} disabled aria-label="Account type (managed by FiePa)" />
        <p className="fine">Account type changes require administrator review. You cannot change your own role.</p>
        <button className="btn" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button>
        {message && <p role="status">{message}</p>}
      </form>
    </main>
  );
}
