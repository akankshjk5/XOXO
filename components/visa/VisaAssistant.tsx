"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, FileText, Clock, IndianRupee, CalendarCheck, Check } from "lucide-react";
import toast from "react-hot-toast";
import { visaAPI } from "@/lib/api";

interface VisaInfo {
  country?: string;
  type: string;
  processing: string;
  fee: string;
  stay: string;
  docs: string[];
}

export function VisaAssistant() {
  const [query, setQuery] = useState("");
  const [info, setInfo] = useState<VisaInfo | null>(null);
  const [notFoundMsg, setNotFoundMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [popular, setPopular] = useState<VisaInfo[]>([]);

  const [form, setForm] = useState({ name: "", email: "", destination: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    visaAPI
      .list()
      .then(({ data }) => setPopular(data.data.slice(0, 8)))
      .catch(() => {});
  }, []);

  const lookup = async (country?: string) => {
    const c = (country || query).trim();
    if (!c) return;
    setLoading(true);
    setInfo(null);
    setNotFoundMsg("");
    try {
      const { data } = await visaAPI.getInfo(c);
      if (data.found) {
        setInfo({ country: data.country, ...data.data });
      } else {
        setNotFoundMsg(data.message);
      }
    } catch {
      toast.error("Couldn't fetch visa info.");
    } finally {
      setLoading(false);
    }
  };

  const submitInquiry = async () => {
    if (!form.name || !form.email || !form.destination) {
      toast.error("Please fill name, email and destination.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await visaAPI.inquiry(form);
      toast.success(data.message);
      setForm({ name: "", email: "", destination: "", message: "" });
    } catch {
      toast.error("Couldn't submit inquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-[88px] max-w-[1100px] mx-auto px-4 sm:px-6 pb-16">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 text-green-dark font-semibold text-sm mb-2">
          <FileText className="h-4 w-4" /> Visa Assistant
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-text-dark">Visa made simple</h1>
        <p className="text-text-grey mt-2">Check visa requirements for Indian passport holders.</p>
      </div>

      {/* Search */}
      <div className="flex gap-2 max-w-xl mx-auto mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-grey" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookup()}
            placeholder="Search a country e.g. Thailand"
            className="w-full border border-[#E0E0E0] rounded-full pl-9 pr-4 py-3 focus:border-green-dark outline-none"
          />
        </div>
        <button
          onClick={() => lookup()}
          className="px-6 py-3 rounded-full bg-green-neon text-white font-bold hover:bg-green-dark transition-colors"
        >
          Check
        </button>
      </div>

      {/* Popular chips */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {popular.map((p) => (
          <button
            key={p.country}
            onClick={() => {
              setQuery(p.country || "");
              lookup(p.country);
            }}
            className="px-4 py-1.5 rounded-full text-sm font-medium capitalize border border-[#E0E0E0] text-text-grey hover:border-green-dark"
          >
            {p.country}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center text-text-grey">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {notFoundMsg && (
        <div className="max-w-xl mx-auto text-center bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-800 text-sm">
          {notFoundMsg}
        </div>
      )}

      {/* Result */}
      {info && (
        <div className="max-w-2xl mx-auto border border-[#EBEBEB] rounded-2xl p-6 shadow-sm mb-10">
          <h2 className="text-2xl font-black text-text-dark capitalize mb-4">{info.country}</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <Fact icon={FileText} label="Visa type" value={info.type} />
            <Fact icon={Clock} label="Processing" value={info.processing} />
            <Fact icon={IndianRupee} label="Fee" value={info.fee} />
            <Fact icon={CalendarCheck} label="Max stay" value={info.stay} />
          </div>
          <h3 className="font-bold text-text-dark mb-2">Required documents</h3>
          <ul className="space-y-1.5">
            {info.docs.map((d, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-text-grey">
                <Check className="h-4 w-4 text-green-neon shrink-0" /> {d}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Inquiry */}
      <div className="max-w-2xl mx-auto bg-off-white rounded-2xl p-6">
        <h3 className="font-bold text-text-dark mb-1">Need help with your visa?</h3>
        <p className="text-sm text-text-grey mb-4">Our visa team will get back within 24 hours.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
            className="border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:border-green-dark outline-none bg-white"
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            className="border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:border-green-dark outline-none bg-white"
          />
          <input
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
            placeholder="Destination"
            className="border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:border-green-dark outline-none bg-white sm:col-span-2"
          />
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Tell us about your trip…"
            rows={3}
            className="border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:border-green-dark outline-none resize-none bg-white sm:col-span-2"
          />
        </div>
        <button
          onClick={submitInquiry}
          disabled={submitting}
          className="mt-3 px-6 py-2.5 rounded-full bg-green-neon text-white font-bold hover:bg-green-dark transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Submit inquiry
        </button>
      </div>
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="h-9 w-9 rounded-lg bg-green-dark/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-green-dark" />
      </span>
      <div>
        <p className="text-xs text-text-grey">{label}</p>
        <p className="font-semibold text-text-dark text-sm">{value}</p>
      </div>
    </div>
  );
}
