/**
 * HTTP transport (primary)
 */

import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { TransportConfig } from "../types.js";

export class HttpTransport {
  private config: TransportConfig;

  constructor(config: TransportConfig) {
    this.config = config;
  }

  createTransport() {
    return new SSEServerTransport(`/sse`, {
      // @ts-ignore
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  async start() {
    console.error(`Cat Facts MCP Server running on http://${this.config.host}:${this.config.port}`);
  }
}
