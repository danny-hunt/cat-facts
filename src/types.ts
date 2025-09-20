/**
 * Type definitions for Cat Facts API integration
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
 * Cat Facts: single fact response
 */
export interface CatFactResponse {
  fact: string;
  length: number;
}

/**
 * Cat Facts: multiple facts response
 */
export interface CatFactsResponse {
  data: Array<{ fact: string; length: number }>;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

/**
 * get_cat_fact tool arguments
 */
export interface GetCatFactArgs {
  /** Maximum fact length (1-500) */
  max_length?: number;
}

/**
 * get_cat_facts tool arguments
 */
export interface GetCatFactsArgs {
  /** Number of facts to retrieve (1-100) */
  limit?: number;
  /** Maximum fact length (1-500) */
  max_length?: number;
}
