"use client";

import { useEffect, useState } from "react";
import { Download, CheckSquare, Square } from "lucide-react";
import { packagesAPI } from "@/lib/api";
import type { TravelChecklist } from "@/lib/package-types";
import { LoadingSkeleton } from "@/components/motion/LoadingSkeleton";

interface Props {
  packageId: string;
}

export function TravelChecklist({ packageId }: Props) {
  const [checklist, setChecklist] = useState<TravelChecklist | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    packagesAPI
      .getChecklist(packageId)
      .then(({ data }) => setChecklist(data.data))
      .catch(() => setChecklist(null))
      .finally(() => setLoading(false));
  }, [packageId]);

  const toggle = (id: string) => {
    setChecked((c) => ({ ...c, [id]: !c[id] }));
  };

  const download = () => {
    if (!checklist) return;
    const lines = [
      `XOXO Travels — Trip Checklist`,
      `${checklist.packageTitle}`,
      checklist.destination ? `Destination: ${checklist.destination}` : "",
      "",
      ...checklist.sections.flatMap((s) => [
        `## ${s.title}`,
        ...s.items.map((i) => `[${checked[i.id] ? "x" : " "}] ${i.label}`),
        "",
      ]),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `xoxo-checklist-${packageId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <LoadingSkeleton className="mt-10 h-48 rounded-xl" />;
  }

  if (!checklist) return null;

  return (
    <section className="mt-10 rounded-2xl border border-[#EBEBEB] bg-white p-5 sm:p-6" aria-labelledby="checklist-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 id="checklist-heading" className="section-heading text-xl">
          Travel Checklist
        </h2>
        <button
          type="button"
          onClick={download}
          className="flex items-center gap-2 rounded-full border border-green-dark px-4 py-2 text-sm font-semibold text-green-dark hover:bg-green-dark hover:text-white transition-colors"
        >
          <Download className="h-4 w-4" aria-hidden />
          Download
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {checklist.sections.map((section) => (
          <div key={section.title}>
            <h3 className="font-semibold text-text-dark mb-2">{section.title}</h3>
            <ul className="space-y-2">
              {section.items.map((item) => {
                const isChecked = checked[item.id];
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      className="flex w-full items-start gap-2 text-left text-sm text-text-grey hover:text-text-dark"
                    >
                      {isChecked ? (
                        <CheckSquare className="h-4 w-4 shrink-0 text-green-dark mt-0.5" aria-hidden />
                      ) : (
                        <Square className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                      )}
                      <span className={isChecked ? "line-through opacity-60" : ""}>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
