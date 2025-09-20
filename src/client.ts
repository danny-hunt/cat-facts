import { RateLimit, RequestCount, CatFactResponse, CatFactsResponse } from "./types.js";

/**
 * Client for interacting with the catfact.ninja API
 * @class CatFactsClient
 */
export class CatFactsClient {
  private readonly apiBaseUrl: string;
  private readonly rateLimit: RateLimit = {
    perSecond: 5,
    perMonth: 100000,
  };
  private requestCount: RequestCount = {
    second: 0,
    month: 0,
    lastReset: Date.now(),
  };

  /**
   * Creates a new CatFactsClient instance
   * @param {string} apiBaseUrl - Base URL for the cat facts API
   */
  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl || "https://catfact.ninja";
  }

  /**
   * Checks and enforces simple rate limiting
   * @throws {Error} If rate limit is exceeded
   * @private
   */
  private checkRateLimit(): void {
    const now = Date.now();
    if (now - this.requestCount.lastReset > 1000) {
      this.requestCount.second = 0;
      this.requestCount.lastReset = now;
    }
    if (this.requestCount.second >= this.rateLimit.perSecond || this.requestCount.month >= this.rateLimit.perMonth) {
      throw new Error("Rate limit exceeded");
    }
    this.requestCount.second++;
    this.requestCount.month++;
  }

  /**
   * Retrieves a single random cat fact
   * @param {number} [maxLength] - Maximum length of the fact
   * @returns {Promise<string>} Formatted single fact
   */
  async getSingleFact(maxLength?: number): Promise<string> {
    this.checkRateLimit();
    const url = new URL("/fact", this.apiBaseUrl);
    if (typeof maxLength === "number") {
      url.searchParams.set("max_length", String(maxLength));
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Cat Facts API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as CatFactResponse;
    return `Fact: ${data.fact}\nLength: ${data.length}`;
  }

  /**
   * Retrieves multiple random cat facts
   * @param {number} [limit] - Number of facts to retrieve
   * @param {number} [maxLength] - Maximum length of each fact
   * @returns {Promise<string>} Formatted facts list
   */
  async getMultipleFacts(limit: number = 5, maxLength?: number): Promise<string> {
    this.checkRateLimit();
    const url = new URL("/facts", this.apiBaseUrl);
    url.searchParams.set("limit", String(Math.max(1, Math.min(limit, 100))));
    if (typeof maxLength === "number") {
      url.searchParams.set("max_length", String(maxLength));
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Cat Facts API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as CatFactsResponse;
    const facts = (data.data || []).map((f, idx) => `${idx + 1}. ${f.fact} (len ${f.length})`);
    return facts.join("\n") || "No cat facts found";
  }
}
