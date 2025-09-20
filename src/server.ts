/**
 * Server instance creation
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { CatFactsTool } from "./tools/index.js";
import { ServerConfig, TransportConfig, ToolArgs } from "./types.js";
import { StdioTransport, HttpTransport } from "./transport/index.js";

export class CatFactsMCPServer {
  private server: Server;
  private tool: CatFactsTool;
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
    this.tool = new CatFactsTool(config);

    this.server = new Server(
      {
        name: config.name,
        version: config.version,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.configureToolHandlers(this.server, this.tool);
  }

  private configureToolHandlers(server: Server, tool: CatFactsTool) {
    // List available tools
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: tool.getToolDefinitions(),
      };
    });

    // Handle tool calls
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name } = request.params;
      const args = (request.params.arguments ?? {}) as ToolArgs;

      try {
        const result = await tool.handleToolCall(name, args);
        return result;
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private createStandaloneServer = (): Server => {
    const server = new Server(
      {
        name: this.config.name,
        version: this.config.version,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    const tool = new CatFactsTool(this.config);
    this.configureToolHandlers(server, tool);
    return server;
  };

  async run(transportConfig: TransportConfig) {
    if (transportConfig.type === "stdio") {
      const stdioTransport = new StdioTransport(transportConfig);
      const transport = stdioTransport.createTransport();
      await stdioTransport.start();
      await this.server.connect(transport);
      return;
    }

    // HTTP mode: start streamable HTTP transport with per-session servers
    const httpTransport = new HttpTransport(transportConfig);
    await httpTransport.start(this.createStandaloneServer);
  }
}
