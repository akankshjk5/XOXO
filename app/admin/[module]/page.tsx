import { notFound } from "next/navigation";
import { AdminBookingsModule } from "@/components/admin/AdminBookingsModule";
import { AdminPackagesModule } from "@/components/admin/AdminPackagesModule";
import { AdminDestinationsModule } from "@/components/admin/AdminDestinationsModule";
import { AdminUsersModule } from "@/components/admin/AdminUsersModule";
import { AdminGuidesModule } from "@/components/admin/AdminGuidesModule";
import { AdminGroupsModule } from "@/components/admin/AdminGroupsModule";
import { AdminReviewsModule } from "@/components/admin/AdminReviewsModule";
import { AdminCouponsModule } from "@/components/admin/AdminCouponsModule";
import { AdminSettingsModule } from "@/components/admin/AdminSettingsModule";
import { getModuleMeta } from "@/lib/admin/navigation";

const MODULES: Record<string, React.ComponentType> = {
  bookings: AdminBookingsModule,
  packages: AdminPackagesModule,
  destinations: AdminDestinationsModule,
  users: AdminUsersModule,
  guides: AdminGuidesModule,
  groups: AdminGroupsModule,
  reviews: AdminReviewsModule,
  coupons: AdminCouponsModule,
  settings: AdminSettingsModule,
};

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
  const Component = MODULES[module];
  if (!Component) notFound();
  return <Component />;
}
