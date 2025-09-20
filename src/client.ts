/**
 * External API client for cat facts
 */

import fetch from 'node-fetch';
import { CatFactResponse, CatFactsResponse, ToolArgs, ServerConfig } from './types.js';

export class CatFactsClient {
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
  }

  /**
   * Fetch a single cat fact
   */
  async getCatFact(args: ToolArgs = {}): Promise<CatFactResponse> {
    const { max_length } = args;
    let url = `${this.config.apiBaseUrl}/fact`;
    
    if (max_length && max_length >= this.config.minLength && max_length <= this.config.maxLength) {
      url += `?max_length=${max_length}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json() as CatFactResponse;
  }

  /**
   * Fetch multiple cat facts
   */
  async getCatFacts(args: ToolArgs = {}): Promise<CatFactsResponse> {
    const { limit = this.config.defaultLimit, max_length } = args;
    
    // Validate limit
    const validatedLimit = Math.min(Math.max(limit, 1), this.config.maxLimit);
    
    let url = `${this.config.apiBaseUrl}/facts?limit=${validatedLimit}`;
    
    if (max_length && max_length >= this.config.minLength && max_length <= this.config.maxLength) {
      url += `&max_length=${max_length}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json() as CatFactsResponse;
  }

  /**
   * Validate tool arguments
   */
  validateArgs(args: ToolArgs): { isValid: boolean; error?: string } {
    if (args.max_length !== undefined) {
      if (args.max_length < this.config.minLength || args.max_length > this.config.maxLength) {
        return {
          isValid: false,
          error: `max_length must be between ${this.config.minLength} and ${this.config.maxLength}`
        };
      }
    }

    if (args.limit !== undefined) {
      if (args.limit < 1 || args.limit > this.config.maxLimit) {
        return {
          isValid: false,
          error: `limit must be between 1 and ${this.config.maxLimit}`
        };
      }
    }

    return { isValid: true };
  }
}