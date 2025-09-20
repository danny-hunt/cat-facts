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

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.tool.getToolDefinitions(),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name } = request.params;
      const args = (request.params.arguments ?? {}) as ToolArgs;

      try {
        const result = await this.tool.handleToolCall(name, args);
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

  async run(transportConfig: TransportConfig) {
    let transport;

    if (transportConfig.type === "stdio") {
      const stdioTransport = new StdioTransport(transportConfig);
      transport = stdioTransport.createTransport();
      await stdioTransport.start();
    } else {
      const httpTransport = new HttpTransport(transportConfig);
      transport = httpTransport.createTransport();
      await httpTransport.start();
    }

    await this.server.connect(transport);
  }
}
