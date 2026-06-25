"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Film, Sparkles, Zap } from "lucide-react";
import toast from "react-hot-toast";
import {
  clearIntroSeen,
  getReduceAnimationsPreference,
  isIntroDisabled,
  requestIntroReplay,
  setIntroDisabled,
  setReduceAnimationsPreference,
} from "@/lib/intro-storage";
import { dispatchExperienceChange } from "@/hooks/useReducedMotion";
import { useIntro } from "@/context/IntroContext";

export function ExperienceSettings() {
  const router = useRouter();
  const { replayIntro } = useIntro();
  const [disabled, setDisabled] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDisabled(isIntroDisabled());
    setReduceMotion(getReduceAnimationsPreference());
  }, []);

  if (!mounted) {
    return <div className="min-h-[40vh] flex items-center justify-center text-text-grey">Loading…</div>;
  }

  const toggleDisabled = (next: boolean) => {
    setDisabled(next);
    setIntroDisabled(next);
    toast.success(next ? "Brand film disabled" : "Brand film enabled");
  };

  const toggleReduce = (next: boolean) => {
    setReduceMotion(next);
    setReduceAnimationsPreference(next);
    dispatchExperienceChange();
    toast.success(next ? "Animations reduced" : "Full animations enabled");
  };

  const handleReplay = () => {
    clearIntroSeen();
    requestIntroReplay();
    replayIntro();
    toast.success("Brand film will play on homepage");
    router.push("/");
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <SettingRow
        icon={Film}
        title="Cinematic brand film"
        description="Play the full-screen travel film on your first visit"
        checked={!disabled}
        onChange={(on) => toggleDisabled(!on)}
      />
      <SettingRow
        icon={Sparkles}
        title="Replay brand film"
        description="Watch the intro again from the homepage"
        action={
          <button
            type="button"
            onClick={handleReplay}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-green-dark text-white hover:bg-green-mid transition-colors"
          >
            Replay now
          </button>
        }
      />
      <SettingRow
        icon={Zap}
        title="Reduce animations"
        description="Minimize motion across the app (in addition to system settings)"
        checked={reduceMotion}
        onChange={toggleReduce}
      />
    </div>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  checked?: boolean;
  onChange?: (on: boolean) => void;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-2xl border border-[#EBEBEB] bg-white shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-dark/10 text-green-dark">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-text-dark">{title}</p>
        <p className="text-sm text-text-grey mt-0.5">{description}</p>
        {action && <div className="mt-3">{action}</div>}
      </div>
      {onChange !== undefined && checked !== undefined && (
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
            checked ? "bg-green-dark" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
              checked ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      )}
    </div>
  );
}
