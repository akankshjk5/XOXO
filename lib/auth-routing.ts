export const USER_ONLY_ROUTE_PREFIXES = [
  "/dashboard",
  "/profile",
  "/wishlist",
  "/bookings",
] as const;

type RoleUser = { role?: string | null; name?: string; email?: string };

export function getUserRole(user: RoleUser | null | undefined): string {
  return user?.role || "user";
}

export function isAdminRole(role?: string | null): boolean {
  return role === "admin";
}

export function isUserOnlyRoute(pathname: string): boolean {
  return USER_ONLY_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/** Post-login destination based on role (admins always land in admin). */
export function getPostLoginPath(user: RoleUser, redirect?: string | null): string {
  const role = getUserRole(user);
  if (isAdminRole(role)) return "/admin";
  return redirect || "/dashboard";
}

/** Where to send a user after a successful booking payment. */
export function getBookingConfirmationPath(bookingId: string, bookingRef: string): string {
  const params = new URLSearchParams({ id: bookingId, ref: bookingRef });
  return `/booking/confirmation?${params.toString()}`;
}

/** Bookings list in dashboard (travelers) or admin panel (admins). */
export function getBookingsHubPath(user: RoleUser): string {
  if (isAdminRole(getUserRole(user))) return "/admin/bookings";
  return "/dashboard?tab=bookings";
}
