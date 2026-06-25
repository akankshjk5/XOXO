const { MapsProvider } = require("./MapsProvider");
const logger = require("../../config/logger");
const { withRetry, logIntegrationFailure } = require("../../utils/integration");

const SAMPLE_PREDICTIONS = [
  { placeId: "mock_bkk", description: "Bangkok, Thailand", mainText: "Bangkok" },
  { placeId: "mock_dxb", description: "Dubai, United Arab Emirates", mainText: "Dubai" },
  { placeId: "mock_sin", description: "Singapore", mainText: "Singapore" },
  { placeId: "mock_bali", description: "Bali, Indonesia", mainText: "Bali" },
];

class GoogleMapsProvider extends MapsProvider {
  get name() {
    return "google";
  }

  isLive() {
    return Boolean(process.env.GOOGLE_MAPS_API_KEY);
  }

  #key() {
    return process.env.GOOGLE_MAPS_API_KEY;
  }

  async autocomplete(query) {
    if (!this.isLive()) {
      const q = query.toLowerCase();
      const predictions = SAMPLE_PREDICTIONS.filter(
        (p) =>
          p.description.toLowerCase().includes(q) ||
          p.mainText.toLowerCase().includes(q)
      );
      return { predictions, demo: true };
    }

    try {
      return await withRetry(
        async () => {
          const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
          url.searchParams.set("input", query);
          url.searchParams.set("key", this.#key());
          url.searchParams.set("types", "(cities)");

          const res = await fetch(url);
          const data = await res.json();

          if (data.status === "OVER_QUERY_LIMIT" || data.status === "RESOURCE_EXHAUSTED") {
            const err = new Error(`Google Places: ${data.status}`);
            err.statusCode = 429;
            throw err;
          }

          if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
            logger.warn("Google Places autocomplete error", { status: data.status });
            return { predictions: [] };
          }

          return {
            predictions: (data.predictions || []).map((p) => ({
              placeId: p.place_id,
              description: p.description,
              mainText: p.structured_formatting?.main_text,
            })),
          };
        },
        { label: "google:autocomplete", maxAttempts: 3 }
      );
    } catch (err) {
      logIntegrationFailure("google:autocomplete", err, { fallback: "demo" });
      return { predictions: [], demo: true, fallback: true };
    }
  }

  async geocode(address) {
    if (!this.isLive()) {
      return { results: [], demo: true };
    }

    try {
      return await withRetry(
        async () => {
          const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
          url.searchParams.set("address", address);
          url.searchParams.set("key", this.#key());

          const res = await fetch(url);
          const data = await res.json();

          if (data.status === "OVER_QUERY_LIMIT") {
            const err = new Error("Google Geocode: OVER_QUERY_LIMIT");
            err.statusCode = 429;
            throw err;
          }

          return {
            results: (data.results || []).map((r) => ({
              formattedAddress: r.formatted_address,
              placeId: r.place_id,
              location: r.geometry?.location,
            })),
          };
        },
        { label: "google:geocode", maxAttempts: 3 }
      );
    } catch (err) {
      logIntegrationFailure("google:geocode", err, { fallback: "demo" });
      return { results: [], demo: true, fallback: true };
    }
  }

  async placeDetails(placeId) {
    if (!this.isLive()) {
      const sample = SAMPLE_PREDICTIONS.find((p) => p.placeId === placeId);
      return {
        result: sample
          ? { name: sample.mainText, formattedAddress: sample.description, location: null }
          : null,
        demo: true,
      };
    }

    try {
      return await withRetry(
        async () => {
          const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
          url.searchParams.set("place_id", placeId);
          url.searchParams.set("key", this.#key());
          url.searchParams.set("fields", "name,formatted_address,geometry,photos");

          const res = await fetch(url);
          const data = await res.json();
          const r = data.result;
          if (!r) return { result: null };

          return {
            result: {
              name: r.name,
              formattedAddress: r.formatted_address,
              location: r.geometry?.location,
            },
          };
        },
        { label: "google:placeDetails", maxAttempts: 3 }
      );
    } catch (err) {
      logIntegrationFailure("google:placeDetails", err, { fallback: "demo" });
      return { result: null, demo: true, fallback: true };
    }
  }
}

module.exports = { GoogleMapsProvider };
