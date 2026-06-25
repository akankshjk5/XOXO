import { ExperienceSettings } from "@/components/settings/ExperienceSettings";

export const metadata = {
  title: "Experience Settings | XOXO Travels",
  description: "Control cinematic intro, animations, and brand film preferences.",
};

export default function ExperienceSettingsPage() {
  return (
    <div className="pt-[88px] max-w-[900px] mx-auto px-4 sm:px-6 pb-16">
      <div className="mb-8">
        <p className="text-sm font-semibold text-green-dark mb-1">Settings</p>
        <h1 className="text-3xl font-black text-text-dark">Experience</h1>
        <p className="text-text-grey mt-2">Customize how XOXO Travels greets you.</p>
      </div>
      <ExperienceSettings />
    </div>
  );
}
