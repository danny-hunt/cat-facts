import {
    RateLimit,
    RequestCount,
    BraveWeb,
    BravePoiResponse,
    BraveDescription,
    BraveLocation
} from './types.js';

/**
 * Client for interacting with the Brave Search API
 * @class BraveClient
 */
export class BraveClient {
    private readonly apiKey: string;
    private readonly rateLimit: RateLimit = {
        perSecond: 1,
        perMonth: 15000
    };
    private requestCount: RequestCount = {
        second: 0,
        month: 0,
        lastReset: Date.now()
    };

    /**
     * Creates a new BraveClient instance
     * @param {string} apiKey - Brave API key for authentication
     */
    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error('API key is required');
        }
        this.apiKey = apiKey;
    }

    /**
     * Checks and enforces rate limiting
     * @throws {Error} If rate limit is exceeded
     * @private
     */
    private checkRateLimit(): void {
        const now = Date.now();
        if (now - this.requestCount.lastReset > 1000) {
            this.requestCount.second = 0;
            this.requestCount.lastReset = now;
        }
        if (this.requestCount.second >= this.rateLimit.perSecond ||
            this.requestCount.month >= this.rateLimit.perMonth) {
            throw new Error('Rate limit exceeded');
        }
        this.requestCount.second++;
        this.requestCount.month++;
    }

    /**
     * Performs a web search using Brave's Web Search API
     * @param {string} query - Search query
     * @param {number} count - Number of results to return (default: 10, max: 20)
     * @param {number} offset - Pagination offset (default: 0, max: 9)
     * @returns {Promise<string>} Formatted search results
     */
    async performWebSearch(query: string, count: number = 10, offset: number = 0): Promise<string> {
        this.checkRateLimit();
        const url = new URL('https://api.search.brave.com/res/v1/web/search');
        url.searchParams.set('q', query);
        url.searchParams.set('count', Math.min(count, 20).toString());
        url.searchParams.set('offset', offset.toString());

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip',
                'X-Subscription-Token': this.apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`Brave API error: ${response.status} ${response.statusText}\n${await response.text()}`);
        }

        const data = await response.json() as BraveWeb;

        // Extract web results
        const results = (data.web?.results || []).map(result => ({
            title: result.title || '',
            description: result.description || '',
            url: result.url || ''
        }));

        return results.map(r =>
            `Title: ${r.title}\nDescription: ${r.description}\nURL: ${r.url}`
        ).join('\n\n');
    }

    /**
     * Performs a local search using Brave's Local Search API
     * @param {string} query - Local search query
     * @param {number} count - Number of results to return (default: 5, max: 20)
     * @returns {Promise<string>} Formatted local search results
     */
    async performLocalSearch(query: string, count: number = 5): Promise<string> {
        this.checkRateLimit();
        
        // Initial search to get location IDs
        const webUrl = new URL('https://api.search.brave.com/res/v1/web/search');
        webUrl.searchParams.set('q', query);
        webUrl.searchParams.set('search_lang', 'en');
        webUrl.searchParams.set('result_filter', 'locations');
        webUrl.searchParams.set('count', Math.min(count, 20).toString());

        const webResponse = await fetch(webUrl, {
            headers: {
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip',
                'X-Subscription-Token': this.apiKey
            }
        });

        if (!webResponse.ok) {
            throw new Error(`Brave API error: ${webResponse.status} ${webResponse.statusText}\n${await webResponse.text()}`);
        }

        const webData = await webResponse.json() as BraveWeb;
        const locationIds = webData.locations?.results?.filter((r): r is { id: string; title?: string } => r.id != null).map(r => r.id) || [];

        if (locationIds.length === 0) {
            return this.performWebSearch(query, count); // Fallback to web search
        }

        // Get POI details and descriptions in parallel
        const [poisData, descriptionsData] = await Promise.all([
            this.getPoisData(locationIds),
            this.getDescriptionsData(locationIds)
        ]);

        return this.formatLocalResults(poisData, descriptionsData);
    }

    /**
     * Fetches POI (Points of Interest) data for given location IDs
     * @param {string[]} ids - Array of location IDs
     * @returns {Promise<BravePoiResponse>} POI data response
     * @private
     */
    private async getPoisData(ids: string[]): Promise<BravePoiResponse> {
        this.checkRateLimit();
        const url = new URL('https://api.search.brave.com/res/v1/local/pois');
        ids.filter(Boolean).forEach(id => url.searchParams.append('ids', id));
        
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip',
                'X-Subscription-Token': this.apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`Brave API error: ${response.status} ${response.statusText}\n${await response.text()}`);
        }

        return await response.json() as BravePoiResponse;
    }

    /**
     * Fetches description data for given location IDs
     * @param {string[]} ids - Array of location IDs
     * @returns {Promise<BraveDescription>} Descriptions data response
     * @private
     */
    private async getDescriptionsData(ids: string[]): Promise<BraveDescription> {
        this.checkRateLimit();
        const url = new URL('https://api.search.brave.com/res/v1/local/descriptions');
        ids.filter(Boolean).forEach(id => url.searchParams.append('ids', id));
        
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip',
                'X-Subscription-Token': this.apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`Brave API error: ${response.status} ${response.statusText}\n${await response.text()}`);
        }

        return await response.json() as BraveDescription;
    }

    /**
     * Formats local search results for display
     * @param {BravePoiResponse} poisData - POI data
     * @param {BraveDescription} descData - Descriptions data
     * @returns {string} Formatted results string
     * @private
     */
    private formatLocalResults(poisData: BravePoiResponse, descData: BraveDescription): string {
        return (poisData.results || []).map(poi => {
            const address = [
                poi.address?.streetAddress ?? '',
                poi.address?.addressLocality ?? '',
                poi.address?.addressRegion ?? '',
                poi.address?.postalCode ?? ''
            ].filter(part => part !== '').join(', ') || 'N/A';

            return `Name: ${poi.name}
Address: ${address}
Phone: ${poi.phone || 'N/A'}
Rating: ${poi.rating?.ratingValue ?? 'N/A'} (${poi.rating?.ratingCount ?? 0} reviews)
Price Range: ${poi.priceRange || 'N/A'}
Hours: ${(poi.openingHours || []).join(', ') || 'N/A'}
Description: ${descData.descriptions[poi.id] || 'No description available'}
`;
        }).join('\n---\n') || 'No local results found';
    }
}