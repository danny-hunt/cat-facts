/**
 * Configuration management for the Cat Facts MCP Server
 */

import { ServerConfig, TransportConfig } from './types.js';

export const defaultServerConfig: ServerConfig = {
  name: 'cat-facts-mcp-server',
  version: '1.0.0',
  apiBaseUrl: 'https://catfact.ninja',
  defaultLimit: 5,
  maxLimit: 100,
  minLength: 1,
  maxLength: 500
};

export const defaultTransportConfig: TransportConfig = {
  type: 'stdio'
};

export function getServerConfig(): ServerConfig {
  return {
    ...defaultServerConfig,
    // Allow environment variable overrides
    name: process.env.MCP_SERVER_NAME || defaultServerConfig.name,
    version: process.env.MCP_SERVER_VERSION || defaultServerConfig.version,
    apiBaseUrl: process.env.CAT_FACTS_API_URL || defaultServerConfig.apiBaseUrl,
    defaultLimit: parseInt(process.env.DEFAULT_LIMIT || defaultServerConfig.defaultLimit.toString()),
    maxLimit: parseInt(process.env.MAX_LIMIT || defaultServerConfig.maxLimit.toString()),
    minLength: parseInt(process.env.MIN_LENGTH || defaultServerConfig.minLength.toString()),
    maxLength: parseInt(process.env.MAX_LENGTH || defaultServerConfig.maxLength.toString())
  };
}

export function getTransportConfig(): TransportConfig {
  const transportType = (process.env.MCP_TRANSPORT || 'stdio') as 'stdio' | 'http';
  
  return {
    type: transportType,
    port: transportType === 'http' ? parseInt(process.env.MCP_PORT || '3000') : undefined,
    host: transportType === 'http' ? (process.env.MCP_HOST || 'localhost') : undefined
  };
}