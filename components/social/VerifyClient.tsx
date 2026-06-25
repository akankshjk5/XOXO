"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Loader2, Upload, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { verificationAPI, uploadAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function VerifyClient() {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<{
    user?: { isVerified?: boolean; verificationStatus?: string; trustScore?: number };
    latestRequest?: { status: string; adminNote?: string; createdAt: string };
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [idType, setIdType] = useState("passport");

  const load = () => {
    verificationAPI.status().then(({ data }) => setStatus(data.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data: up } = await uploadAPI.image(file);
      await verificationAPI.submit({ documentUrl: up.url, idType });
      toast.success("Submitted for verification!");
      load();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Submit failed");
    } finally {
      setUploading(false);
    }
  };

  const verified = status?.user?.isVerified || user?.isVerified;

  return (
    <div className="pt-[88px] max-w-[600px] mx-auto px-4 sm:px-6 pb-16">
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-green-dark/10 mb-4">
          <Shield className="h-8 w-8 text-green-dark" />
        </div>
        <h1 className="text-3xl font-black text-text-dark">Traveler Verification</h1>
        <p className="text-text-grey mt-2">Get the Trusted Traveller badge and boost your trust score.</p>
      </div>

      {verified ? (
        <div className="text-center border border-green-dark/30 bg-green-dark/5 rounded-2xl p-8">
          <BadgeCheck className="h-12 w-12 text-green-dark mx-auto mb-3" />
          <h2 className="text-xl font-bold text-text-dark">You&apos;re verified!</h2>
          <p className="text-text-grey mt-2">Trust score: <strong>{status?.user?.trustScore ?? 0}</strong></p>
          <p className="text-sm text-text-grey mt-4">Your badge appears on match cards, nearby discovery, and group trips.</p>
        </div>
      ) : status?.user?.verificationStatus === "pending" ? (
        <div className="text-center border border-amber-200 bg-amber-50 rounded-2xl p-8">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-amber-900">Under review</h2>
          <p className="text-sm text-amber-800 mt-2">We&apos;ll verify within 24–48 hours.</p>
        </div>
      ) : status?.user?.verificationStatus === "rejected" ? (
        <div className="border border-red-200 bg-red-50 rounded-2xl p-6 mb-6">
          <p className="text-red-800 font-semibold">Previous submission declined</p>
          <p className="text-sm text-red-700 mt-1">{status.latestRequest?.adminNote || "Please upload a clearer document."}</p>
        </div>
      ) : null}

      {!verified && status?.user?.verificationStatus !== "pending" && (
        <div className="border border-[#EBEBEB] rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold mb-2 block">ID type</label>
            <select value={idType} onChange={(e) => setIdType(e.target.value)} className="w-full border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:border-green-dark outline-none">
              <option value="passport">Passport</option>
              <option value="aadhaar">Aadhaar</option>
              <option value="driving_license">Driving License</option>
            </select>
          </div>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#E0E0E0] rounded-2xl p-8 cursor-pointer hover:border-green-dark transition-colors">
            {uploading ? <Loader2 className="h-8 w-8 animate-spin text-green-dark" /> : <Upload className="h-8 w-8 text-text-grey" />}
            <span className="mt-2 text-sm font-semibold text-text-dark">Upload ID document</span>
            <span className="text-xs text-text-grey">JPEG or PNG, max 5MB</span>
            <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={uploading} />
          </label>
          <ul className="text-xs text-text-grey space-y-1 list-disc pl-4">
            <li>Document is reviewed by our team only — never shared publicly</li>
            <li>Verified users get +30 trust score</li>
            <li>Required for verified-only nearby filter</li>
          </ul>
        </div>
      )}
    </div>
  );
}
