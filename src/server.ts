import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from "@modelcontextprotocol/sdk/types.js";
import { CatFactsClient } from "./client.js";
import {
  webSearchToolDefinition,
  localSearchToolDefinition,
  handleWebSearchTool,
  handleLocalSearchTool,
} from "./tools/index.js";

/**
 * Main server class for Cat Facts MCP integration
 * @class CatFactsServer
 */
export class CatFactsServer {
  private client: CatFactsClient;
  private server: Server;

  /**
   * Creates a new CatFactsServer instance
   * @param {string} apiBaseUrl - Base URL for cat facts API
   */
  constructor(apiBaseUrl: string) {
    this.client = new CatFactsClient(apiBaseUrl);
    this.server = new Server(
      {
        name: "cat-facts",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  /**
   * Sets up MCP request handlers for tools
   * @private
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [webSearchToolDefinition, localSearchToolDefinition],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "get_cat_fact":
          return handleWebSearchTool(this.client, args);

        case "get_cat_facts":
          return handleLocalSearchTool(this.client, args);

        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
    });
  }

  /**
   * Configures error handling and graceful shutdown
   * @private
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error) => console.error("[MCP Error]", error);

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Returns the underlying MCP server instance
   * @returns {Server} MCP server instance
   */
  getServer(): Server {
    return this.server;
  }
}

/**
 * Factory function for creating standalone server instances
 * Used by HTTP transport for session-based connections
 * @param {string} apiBaseUrl - Base URL for cat facts API
 * @returns {Server} Configured MCP server instance
 */
export function createStandaloneServer(apiBaseUrl: string): Server {
  const server = new Server(
    {
      name: "cat-facts-discovery",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  const client = new CatFactsClient(apiBaseUrl);

  // Set up handlers
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [webSearchToolDefinition, localSearchToolDefinition],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "get_cat_fact":
        return handleWebSearchTool(client, args);

      case "get_cat_facts":
        return handleLocalSearchTool(client, args);

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  });

  return server;
}
