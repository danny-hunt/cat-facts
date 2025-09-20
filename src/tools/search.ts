import { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { BraveClient } from '../client.js';
import { WebSearchArgs, LocalSearchArgs } from '../types.js';

/**
 * Tool definition for Brave web search
 */
export const webSearchToolDefinition: Tool = {
    name: "brave_web_search",
    description:
        "Performs a web search using the Brave Search API, ideal for general queries, news, articles, and online content. " +
        "Use this for broad information gathering, recent events, or when you need diverse web sources. " +
        "Supports pagination, content filtering, and freshness controls. " +
        "Maximum 20 results per request, with offset for pagination.",
    inputSchema: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description: "Search query (max 400 chars, 50 words)"
            },
            count: {
                type: "number",
                description: "Number of results (1-20, default 10)",
                default: 10
            },
            offset: {
                type: "number",
                description: "Pagination offset (max 9, default 0)",
                default: 0
            },
        },
        required: ["query"],
    },
};

/**
 * Tool definition for Brave local search
 */
export const localSearchToolDefinition: Tool = {
    name: "brave_local_search",
    description:
        "Searches for local businesses and places using Brave's Local Search API. " +
        "Best for queries related to physical locations, businesses, restaurants, services, etc. " +
        "Returns detailed information including:\n" +
        "- Business names and addresses\n" +
        "- Ratings and review counts\n" +
        "- Phone numbers and opening hours\n" +
        "Use this when the query implies 'near me' or mentions specific locations. " +
        "Automatically falls back to web search if no local results are found.",
    inputSchema: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description: "Local search query (e.g. 'pizza near Central Park')"
            },
            count: {
                type: "number",
                description: "Number of results (1-20, default 5)",
                default: 5
            },
        },
        required: ["query"]
    }
};

/**
 * Type guard for web search arguments
 * @param {unknown} args - Arguments to validate
 * @returns {boolean} True if arguments are valid for web search
 */
function isWebSearchArgs(args: unknown): args is WebSearchArgs {
    return (
        typeof args === "object" &&
        args !== null &&
        "query" in args &&
        typeof (args as { query: string }).query === "string"
    );
}

/**
 * Type guard for local search arguments
 * @param {unknown} args - Arguments to validate
 * @returns {boolean} True if arguments are valid for local search
 */
function isLocalSearchArgs(args: unknown): args is LocalSearchArgs {
    return (
        typeof args === "object" &&
        args !== null &&
        "query" in args &&
        typeof (args as { query: string }).query === "string"
    );
}

/**
 * Handles web search tool calls
 * @param {BraveClient} client - Brave API client instance
 * @param {unknown} args - Tool call arguments
 * @returns {Promise<CallToolResult>} Tool call result
 */
export async function handleWebSearchTool(client: BraveClient, args: unknown): Promise<CallToolResult> {
    try {
        if (!args) {
            throw new Error("No arguments provided");
        }

        if (!isWebSearchArgs(args)) {
            throw new Error("Invalid arguments for brave_web_search");
        }

        const { query, count = 10, offset = 0 } = args;
        const results = await client.performWebSearch(query, count, offset);
        
        return {
            content: [{ type: "text", text: results }],
            isError: false,
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
}

/**
 * Handles local search tool calls
 * @param {BraveClient} client - Brave API client instance
 * @param {unknown} args - Tool call arguments
 * @returns {Promise<CallToolResult>} Tool call result
 */
export async function handleLocalSearchTool(client: BraveClient, args: unknown): Promise<CallToolResult> {
    try {
        if (!args) {
            throw new Error("No arguments provided");
        }

        if (!isLocalSearchArgs(args)) {
            throw new Error("Invalid arguments for brave_local_search");
        }

        const { query, count = 5 } = args;
        const results = await client.performLocalSearch(query, count);
        
        return {
            content: [{ type: "text", text: results }],
            isError: false,
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
}
