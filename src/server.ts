import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { BraveClient } from './client.js';
import {
    webSearchToolDefinition,
    localSearchToolDefinition,
    handleWebSearchTool,
    handleLocalSearchTool
} from './tools/index.js';

/**
 * Main server class for Brave Search MCP integration
 * @class BraveServer
 */
export class BraveServer {
    private client: BraveClient;
    private server: Server;

    /**
     * Creates a new BraveServer instance
     * @param {string} apiKey - Brave API key for authentication
     */
    constructor(apiKey: string) {
        this.client = new BraveClient(apiKey);
        this.server = new Server(
            {
                name: 'brave-search',
                version: '0.1.0',
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
                case 'brave_web_search':
                    return handleWebSearchTool(this.client, args);
                
                case 'brave_local_search':
                    return handleLocalSearchTool(this.client, args);
                
                default:
                    throw new McpError(
                        ErrorCode.MethodNotFound,
                        `Unknown tool: ${name}`
                    );
            }
        });
    }

    /**
     * Configures error handling and graceful shutdown
     * @private
     */
    private setupErrorHandling(): void {
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        
        process.on('SIGINT', async () => {
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
 * @param {string} apiKey - Brave API key for authentication
 * @returns {Server} Configured MCP server instance
 */
export function createStandaloneServer(apiKey: string): Server {
    const server = new Server(
        {
            name: "brave-search-discovery",
            version: "0.1.0",
        },
        {
            capabilities: {
                tools: {},
            },
        },
    );

    const client = new BraveClient(apiKey);

    // Set up handlers
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: [webSearchToolDefinition, localSearchToolDefinition],
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        switch (name) {
            case 'brave_web_search':
                return handleWebSearchTool(client, args);
            
            case 'brave_local_search':
                return handleLocalSearchTool(client, args);
            
            default:
                throw new McpError(
                    ErrorCode.MethodNotFound,
                    `Unknown tool: ${name}`
                );
        }
    });

    return server;
}