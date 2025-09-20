/**
 * HTTP transport (primary)
 */

import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import type { ServerResponse } from "node:http";
import { TransportConfig } from "../types.js";

export class HttpTransport {
  private config: TransportConfig;

  constructor(config: TransportConfig) {
    this.config = config;
  }

  createTransport() {
    // Note: A proper HTTP server should provide a real ServerResponse from an SSE GET handler.
    // For now, return a transport with a placeholder response to satisfy types; runtime use of
    // HTTP transport isn't enabled by default.
    return new SSEServerTransport(`/sse`, {} as unknown as ServerResponse);
  }

  async start() {
    console.error(`Cat Facts MCP Server running on http://${this.config.host}:${this.config.port}`);
  }
}
