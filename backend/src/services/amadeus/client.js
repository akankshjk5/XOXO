const logger = require("../../config/logger");
const { withRetry } = require("../../utils/integration");

const TEST_BASE = "https://test.api.amadeus.com";
const PROD_BASE = "https://api.amadeus.com";

class AmadeusClient {
  constructor() {
    this.apiKey = process.env.AMADEUS_API_KEY;
    this.apiSecret = process.env.AMADEUS_API_SECRET;
    this.baseUrl =
      process.env.AMADEUS_ENV === "production" ? PROD_BASE : TEST_BASE;
    this.token = null;
    this.tokenExpiresAt = 0;
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiSecret);
  }

  #invalidateToken() {
    this.token = null;
    this.tokenExpiresAt = 0;
  }

  async getAccessToken() {
    if (this.token && Date.now() < this.tokenExpiresAt - 60_000) {
      return this.token;
    }

    return withRetry(
      async () => {
        const body = new URLSearchParams({
          grant_type: "client_credentials",
          client_id: this.apiKey,
          client_secret: this.apiSecret,
        });

        const res = await fetch(`${this.baseUrl}/v1/security/oauth2/token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });

        if (!res.ok) {
          const text = await res.text();
          const err = new Error("Amadeus authentication failed");
          err.statusCode = res.status;
          logger.error("Amadeus auth failed", { status: res.status, body: text });
          throw err;
        }

        const data = await res.json();
        this.token = data.access_token;
        this.tokenExpiresAt = Date.now() + (data.expires_in || 1800) * 1000;
        return this.token;
      },
      { label: "amadeus:auth", maxAttempts: 3 }
    );
  }

  async request(path, { method = "GET", query, body } = {}) {
    return withRetry(
      async () => {
        const token = await this.getAccessToken();
        const url = new URL(`${this.baseUrl}${path}`);
        if (query) {
          Object.entries(query).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== "") {
              url.searchParams.set(k, String(v));
            }
          });
        }

        const res = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        if (res.status === 401) {
          this.#invalidateToken();
          const err = new Error("Amadeus token expired");
          err.statusCode = 401;
          throw err;
        }

        if (!res.ok) {
          const text = await res.text();
          logger.warn("Amadeus API error", { path, status: res.status, body: text });
          const err = new Error(`Amadeus API error: ${res.status}`);
          err.statusCode = res.status >= 500 ? 502 : res.status;
          throw err;
        }

        return res.json();
      },
      { label: `amadeus:${path}`, maxAttempts: 3 }
    );
  }
}

let singleton = null;

function getAmadeusClient() {
  if (!singleton) singleton = new AmadeusClient();
  return singleton;
}

module.exports = { AmadeusClient, getAmadeusClient };
