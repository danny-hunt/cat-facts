/**
 * Type definitions for Brave Search API integration
 */

/**
 * Rate limiting configuration
 * @interface RateLimit
 */
export interface RateLimit {
    /** Requests per second */
    perSecond: number;
    /** Requests per month */
    perMonth: number;
}

/**
 * Rate limiting state tracking
 * @interface RequestCount
 */
export interface RequestCount {
    /** Current second count */
    second: number;
    /** Current month count */
    month: number;
    /** Last reset timestamp */
    lastReset: number;
}

/**
 * Brave Web Search API response structure
 * @interface BraveWeb
 */
export interface BraveWeb {
    web?: {
        results?: Array<{
            title: string;
            description: string;
            url: string;
            language?: string;
            published?: string;
            rank?: number;
        }>;
    };
    locations?: {
        results?: Array<{
            id: string;
            title?: string;
        }>;
    };
}

/**
 * Brave Local Search location data
 * @interface BraveLocation
 */
export interface BraveLocation {
    id: string;
    name: string;
    address: {
        streetAddress?: string;
        addressLocality?: string;
        addressRegion?: string;
        postalCode?: string;
    };
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    phone?: string;
    rating?: {
        ratingValue?: number;
        ratingCount?: number;
    };
    openingHours?: string[];
    priceRange?: string;
}

/**
 * Brave POI (Points of Interest) API response
 * @interface BravePoiResponse
 */
export interface BravePoiResponse {
    results: BraveLocation[];
}

/**
 * Brave Descriptions API response
 * @interface BraveDescription
 */
export interface BraveDescription {
    descriptions: { [id: string]: string };
}

/**
 * Web search tool arguments
 * @interface WebSearchArgs
 */
export interface WebSearchArgs {
    query: string;
    count?: number;
    offset?: number;
}

/**
 * Local search tool arguments
 * @interface LocalSearchArgs
 */
export interface LocalSearchArgs {
    query: string;
    count?: number;
}