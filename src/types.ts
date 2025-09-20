/**
 * TypeScript type definitions for the Cat Facts MCP Server
 */

export interface CatFact {
  fact: string;
  length: number;
}

export interface CatFactsResponse {
  data: CatFact[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface CatFactResponse {
  fact: string;
  length: number;
}

export interface ToolArgs {
  max_length?: number;
  limit?: number;
}

export interface ServerConfig {
  name: string;
  version: string;
  apiBaseUrl: string;
  defaultLimit: number;
  maxLimit: number;
  minLength: number;
  maxLength: number;
}

export interface TransportConfig {
  type: 'stdio' | 'http';
  port?: number;
  host?: string;
}

export interface CliArgs {
  transport?: 'stdio' | 'http';
  port?: number;
  host?: string;
  help?: boolean;
}