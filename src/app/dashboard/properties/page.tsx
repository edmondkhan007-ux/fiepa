"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Property = {
  id: string;
  title: string;
  property_type: string;
  address: string;
  city: string;
  region: string;
  bedrooms: number;
  monthly_rent: number;
  currency: string;
  status: string;
};

const emptyForm = {
  title: "",
  property_type: "single_room",
  address: "",
  city: "",
  region: "",
  bedrooms: 1,
  monthly_rent: "",
  description: "",
};

export default function PropertiesPage() {
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void loadProperties();
  }, []);

  async function loadProperties() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/";
      return;
    }

    setUserId(user.id);
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const currentRole = profile?.role ?? "tenant";
    setRole(currentRole);

    if (currentRole === "landlord" || currentRole === "admin") {
      const { data, error } = await supabase
        .from("properties")
        .select("id,title,property_type,address,city,region,bedrooms,monthly_rent,currency,status")
        .order("created_at", { ascending: false });

      if (error) setMessage(error.message);
      setProperties(data ?? []);
    }

    setLoading(false);
  }

  async function submitProperty(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const { data, error } = await createClient()
      .from("properties")
      .insert({
        owner_id: userId,
        title: form.title.trim(),
        property_type: form.property_type,
        address: form.address.trim(),
        city: form.city.trim(),
        region: form.region.trim(),
        bedrooms: Number(form.bedrooms),
        monthly_rent: Number(form.monthly_rent),
        currency: "GHS",
        description: form.description.trim() || null,
      })
      .select("id,title,property_type,address,city,region,bedrooms,monthly_rent,currency,status")
      .single();

    if (error) {
      setMessage(error.message);
    } else if (data) {
      setProperties((current) => [data, ...current]);
      setForm(emptyForm);
      setMessage("Property listing saved.");
    }

    setSaving(false);
  }

  if (loading) {
    return <main className="shell"><p className="muted">Loading your properties…</p></main>;
  }

  if (role !== "landlord" && role !== "admin") {
    return (
      <main className="shell">
        <nav className="nav">
          <a className="brand" href="/">FiePa.</a>
          <a className="btn alt" href="/dashboard">Back to dashboard</a>
        </nav>
        <h1>Landlord access</h1>
        <p className="muted">Property listings are available to approved landlord accounts. Your current account role is <strong>{role}</strong>.</p>
        <p className="fine">If you are a landlord, contact the FiePa administrator to have your account reviewed. You cannot change your own account role.</p>
      </main>
    );
  }

  return (
    <main className="shell">
      <nav className="nav">
        <a className="brand" href="/">FiePa.</a>
        <a className="btn alt" href="/dashboard">Back to dashboard</a>
      </nav>

      <h1>My properties</h1>
      <p className="muted">Create and review property records linked to your landlord account.</p>

      <form className="panel" onSubmit={submitProperty}>
        <h2>Add a property</h2>
        <label htmlFor="title">Property title</label>
        <input id="title" required maxLength={100} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Two-bedroom apartment" />

        <label htmlFor="property_type">Property type</label>
        <select id="property_type" value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })}>
          <option value="single_room">Single room</option>
          <option value="hostel">Hostel</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="compound_house">Compound house</option>
          <option value="other">Other</option>
        </select>

        <label htmlFor="address">Street address or area description</label>
        <input id="address" required maxLength={180} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />

        <div className="grid">
          <div>
            <label htmlFor="city">Town / city</label>
            <input id="city" required maxLength={80} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label htmlFor="region">Region</label>
            <input id="region" required maxLength={80} value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
          </div>
        </div>

        <div className="grid">
          <div>
            <label htmlFor="bedrooms">Bedrooms / rooms</label>
            <input id="bedrooms" type="number" min="0" max="50" required value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) })} />
          </div>
          <div>
            <label htmlFor="monthly_rent">Monthly rent (GH₵)</label>
            <input id="monthly_rent" type="number" min="0" step="0.01" required value={form.monthly_rent} onChange={(e) => setForm({ ...form, monthly_rent: e.target.value })} />
          </div>
        </div>

        <label htmlFor="description">Additional details (optional)</label>
        <textarea id="description" rows={4} maxLength={1500} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="btn" disabled={saving}>{saving ? "Saving…" : "Save property"}</button>
        {message && <p role="status">{message}</p>}
      </form>

      <h2>Saved properties</h2>
      {properties.length === 0 ? (
        <p className="muted">You have not added any properties yet.</p>
      ) : (
        properties.map((property) => (
          <article className="tile" key={property.id}>
            <h3>{property.title}</h3>
            <p>{property.property_type.replaceAll("_", " ")} · {property.address}, {property.city}, {property.region}</p>
            <strong>GH₵ {Number(property.monthly_rent).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / month</strong>
            <p className="muted">{property.bedrooms} room(s) · {property.status}</p>
          </article>
        ))
      )}
    </main>
  );
}
