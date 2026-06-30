import type { ConciergePlan, ConciergeIntent } from "@/lib/concierge-types";

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function formatItineraryLocation(plan: ConciergePlan | null, intent?: ConciergeIntent | null) {
  const dest = plan?.itinerary?.destination || intent?.destination || "Your destination";
  const parts = dest.split(",").map((p) => p.trim()).filter(Boolean);
  const city = parts[0] || dest;
  const country = parts.length > 1 ? parts[parts.length - 1] : intent?.origin ? "" : "";
  return { city, country, label: country ? `${city}, ${country}` : city };
}

export function buildItineraryHtml(plan: ConciergePlan | null, intent?: ConciergeIntent | null) {
  const it = plan?.itinerary;
  if (!it) return "<p>No itinerary generated yet.</p>";
  const loc = formatItineraryLocation(plan, intent);
  const days = (it.days || [])
    .map(
      (d) => `
      <section style="margin-bottom:1.25rem;">
        <h3>Day ${d.day}: ${escapeHtml(d.title)}</h3>
        ${d.morning?.activity ? `<p><strong>Morning:</strong> ${escapeHtml(d.morning.activity)}</p>` : ""}
        ${d.afternoon?.activity ? `<p><strong>Afternoon:</strong> ${escapeHtml(d.afternoon.activity)}</p>` : ""}
        ${d.evening?.activity ? `<p><strong>Evening:</strong> ${escapeHtml(d.evening.activity)}</p>` : ""}
      </section>`
    )
    .join("");
  return `<!DOCTYPE html><html><head><title>XOXO Itinerary — ${escapeHtml(loc.label)}</title>
    <style>body{font-family:system-ui,sans-serif;max-width:720px;margin:2rem auto;padding:0 1rem;color:#1a1a1a}
    h1{font-size:1.5rem}h2{color:#1a5c3a;font-size:1rem;text-transform:uppercase;letter-spacing:.05em}
    h3{font-size:1.1rem;margin:.5rem 0}</style></head><body>
    <h1>${escapeHtml(loc.label)}</h1>
    <h2>${it.totalDays} days · XOXO Travels AI Planner</h2>
    ${it.weatherSummary ? `<p>${escapeHtml(it.weatherSummary)}</p>` : ""}
    ${days}
    </body></html>`;
}

export function printItinerary(plan: ConciergePlan | null, intent?: ConciergeIntent | null) {
  const html = buildItineraryHtml(plan, intent);
  const w = window.open("", "_blank", "width=800,height=900");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}

export function downloadItineraryPdf(plan: ConciergePlan | null, intent?: ConciergeIntent | null) {
  printItinerary(plan, intent);
}

export async function shareItineraryLink(shareToken?: string) {
  if (!shareToken) return false;
  const url = `${window.location.origin}/concierge/share/${shareToken}`;
  if (navigator.share) {
    await navigator.share({ title: "My XOXO itinerary", url });
    return true;
  }
  await navigator.clipboard.writeText(url);
  return true;
}
