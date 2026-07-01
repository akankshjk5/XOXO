/** Build page context for AI concierge from URL — no UI changes. */
export function getPageContextFromPath(pathname: string, searchParams?: URLSearchParams | null) {
  const ctx: Record<string, string> = { path: pathname };

  const packageFromQuery = searchParams?.get("package");
  const packageFromPath = pathname.match(/\/packages\/([^/?#]+)/)?.[1];
  const packageId = packageFromQuery || packageFromPath;
  if (packageId) ctx.packageId = packageId;

  const destination = searchParams?.get("destination");
  if (destination) ctx.destination = destination;

  const budget = searchParams?.get("budget");
  if (budget) ctx.budgetINR = budget;

  if (packageId || destination) ctx.source = "package";

  return Object.keys(ctx).length > 1 ? ctx : null;
}
