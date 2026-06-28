import { notFound } from "next/navigation";
import { AdminModuleScaffold } from "@/components/admin/AdminModuleScaffold";
import { AdminBookingsModule } from "@/components/admin/AdminBookingsModule";
import { AdminPackagesModule } from "@/components/admin/AdminPackagesModule";
import { AdminAnalyticsModule } from "@/components/admin/AdminAnalyticsModule";
import { VerificationQueue } from "@/components/admin/VerificationQueue";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { getModuleMeta } from "@/lib/admin/navigation";

const RESERVED = new Set(["logout"]);

interface PageProps {
  params: { module: string };
}

export async function generateMetadata({ params }: PageProps) {
  const meta = getModuleMeta(params.module);
  return {
    title: meta ? `${meta.title} | XOXO Admin` : "Admin | XOXO Travels",
  };
}

export default function AdminModulePage({ params }: PageProps) {
  const { module } = params;

  if (RESERVED.has(module)) {
    notFound();
  }

  if (module === "verification") {
    return (
      <>
        <AdminHeader title="Verification Queue" subtitle="Review traveler identity requests" />
        <div className="p-4 sm:p-6 lg:p-8">
          <VerificationQueue />
        </div>
      </>
    );
  }

  if (module === "bookings") {
    return <AdminBookingsModule />;
  }

  if (module === "packages") {
    return <AdminPackagesModule />;
  }

  if (module === "analytics") {
    return <AdminAnalyticsModule />;
  }

  if (!getModuleMeta(module)) {
    notFound();
  }

  return <AdminModuleScaffold moduleId={module} />;
}
