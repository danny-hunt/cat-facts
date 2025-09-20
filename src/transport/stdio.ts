/**
 * STDIO transport for development
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TransportConfig } from "../types.js";

export class StdioTransport {
  private config: TransportConfig;

  constructor(config: TransportConfig) {
    this.config = config;
  }

  createTransport() {
    return new StdioServerTransport();
  }

  async start() {
    console.error("Cat Facts MCP Server running on stdio");
  }
}
