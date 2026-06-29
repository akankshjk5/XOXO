import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarCheck,
  Package,
  MapPin,
  Users,
  Star,
  Ticket,
  Settings,
  LogOut,
} from "lucide-react";

export type AdminRoleId =
  | "super-admin"
  | "admin"
  | "travel-manager"
  | "support"
  | "finance"
  | "guide-manager";

export interface AdminNavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Roles that can see this item. Empty = all admin roles. */
  roles?: AdminRoleId[];
  badge?: string;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { id: "packages", label: "Packages", href: "/admin/packages", icon: Package },
  { id: "destinations", label: "Destinations", href: "/admin/destinations", icon: MapPin },
  { id: "bookings", label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
  { id: "users", label: "Users", href: "/admin/users", icon: Users },
  { id: "reviews", label: "Reviews", href: "/admin/reviews", icon: Star },
  { id: "coupons", label: "Coupons", href: "/admin/coupons", icon: Ticket },
  { id: "settings", label: "Settings", href: "/admin/settings", icon: Settings },
];

export const ADMIN_FOOTER_NAV: AdminNavItem[] = [
  { id: "logout", label: "Logout", href: "/admin/logout", icon: LogOut },
];

/** Map JWT role to admin panel role (no DB schema change). */
export function mapUserToAdminRole(role?: string): AdminRoleId | null {
  if (role === "admin") return "super-admin";
  return null;
}

export function canAccessNavItem(item: AdminNavItem, adminRole: AdminRoleId | null): boolean {
  if (!adminRole) return false;
  if (!item.roles || item.roles.length === 0) return true;
  return item.roles.includes(adminRole);
}

export function getNavForRole(adminRole: AdminRoleId | null): AdminNavItem[] {
  return ADMIN_NAV.filter((item) => canAccessNavItem(item, adminRole));
}

export interface AdminModuleMeta {
  title: string;
  description: string;
  features: string[];
}

export const ADMIN_MODULE_META: Record<string, AdminModuleMeta> = {
  bookings: {
    title: "Bookings",
    description: "Live booking table with approve, cancel, refund, and guide assignment.",
    features: ["Approve / Cancel", "Refund", "Generate Invoice", "Assign Guide & Driver", "Customer Timeline"],
  },
  packages: {
    title: "Packages",
    description: "Create, edit, and manage travel packages with media and pricing.",
    features: ["CRUD", "Image Upload", "Itinerary Builder", "Pricing & Discounts", "Bulk Import / Export"],
  },
  destinations: {
    title: "Destinations",
    description: "Manage countries, cities, galleries, and SEO metadata.",
    features: ["CRUD", "Hero & Gallery", "Weather & Currency", "Highlights", "SEO"],
  },
  transport: {
    title: "Transport",
    description: "Flights, trains, and ground transport inventory hub.",
    features: ["Provider Status", "Search Rules", "Booking Rules"],
  },
  hotels: {
    title: "Hotels",
    description: "Hotel inventory and partner properties.",
    features: ["Inventory", "Rates", "Availability"],
  },
  guides: {
    title: "Guides",
    description: "Local guides and assignment workflows.",
    features: ["Guide Profiles", "Assignments", "Ratings"],
  },
  users: {
    title: "Users",
    description: "User search, roles, verification, and travel history.",
    features: ["Search & Filters", "Roles", "Sessions", "Wishlist", "Support History"],
  },
  reviews: {
    title: "Reviews",
    description: "Moderate traveler reviews and ratings.",
    features: ["Approve / Reject", "Reply", "Flag", "Hide"],
  },
  coupons: {
    title: "Coupons",
    description: "Promotional codes and usage tracking.",
    features: ["Create / Expire", "Usage Count", "Min Spend", "% or Fixed"],
  },
  payments: {
    title: "Payments",
    description: "Razorpay transactions, refunds, and settlements.",
    features: ["Transactions", "Refunds", "Taxes", "Settlement Status"],
  },
  invoices: {
    title: "Invoices",
    description: "Invoice generation and PDF downloads.",
    features: ["Generate", "Download PDF", "Tax Breakdown"],
  },
  blogs: {
    title: "Blogs",
    description: "Travel stories and SEO content.",
    features: ["Draft / Publish", "Categories", "Featured"],
  },
  notifications: {
    title: "Notifications",
    description: "Email, SMS, push, and in-app messaging.",
    features: ["Email", "SMS", "Push", "In-App"],
  },
  analytics: {
    title: "Analytics",
    description: "Revenue, conversion, traffic, and device insights.",
    features: ["Revenue", "Bookings", "Conversion", "Heatmaps"],
  },
  support: {
    title: "Support Tickets",
    description: "Customer support queue and SLA tracking.",
    features: ["Ticket Queue", "Assign Agent", "SLA"],
  },
  settings: {
    title: "Settings",
    description: "Website name, logo, contact details, and social links.",
    features: ["Branding", "Contact", "Social Links"],
  },
};

export function getModuleMeta(moduleId: string): AdminModuleMeta | null {
  return ADMIN_MODULE_META[moduleId] ?? null;
}
