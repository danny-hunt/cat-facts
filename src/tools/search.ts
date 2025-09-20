import { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { CatFactsClient } from "../client.js";
import { GetCatFactArgs, GetCatFactsArgs } from "../types.js";

/**
 * Tool definition for getting a single cat fact
 */
export const webSearchToolDefinition: Tool = {
  name: "get_cat_fact",
  description: "Retrieves a single random cat fact from catfact.ninja. " + "Optionally constrain by maximum length.",
  inputSchema: {
    type: "object",
    properties: {
      max_length: {
        type: "number",
        description: "Maximum fact length (1-500)",
      },
    },
    required: [],
  },
};

/**
 * Tool definition for getting multiple cat facts
 */
export const localSearchToolDefinition: Tool = {
  name: "get_cat_facts",
  description:
    "Retrieves multiple random cat facts from catfact.ninja. " + "Supports limit and maximum length filters.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Number of facts (1-100, default 5)",
        default: 5,
      },
      max_length: {
        type: "number",
        description: "Maximum fact length (1-500)",
      },
    },
    required: [],
  },
};

/**
 * Type guard for get_cat_fact arguments
 * @param {unknown} args - Arguments to validate
 * @returns {boolean} True if arguments are valid for single fact
 */
function isWebSearchArgs(args: unknown): args is GetCatFactArgs {
  return typeof args === "object" && args !== null;
}

/**
 * Type guard for get_cat_facts arguments
 * @param {unknown} args - Arguments to validate
 * @returns {boolean} True if arguments are valid for multiple facts
 */
function isLocalSearchArgs(args: unknown): args is GetCatFactsArgs {
  return typeof args === "object" && args !== null;
}

/**
 * Handles get_cat_fact tool calls
 * @param {CatFactsClient} client - Cat Facts API client instance
 * @param {unknown} args - Tool call arguments
 * @returns {Promise<CallToolResult>} Tool call result
 */
export async function handleWebSearchTool(client: CatFactsClient, args: unknown): Promise<CallToolResult> {
  try {
    if (!args) {
      // allow empty args for single fact
      args = {};
    }

    if (!isWebSearchArgs(args)) {
      throw new Error("Invalid arguments for get_cat_fact");
    }

    const { max_length } = args as GetCatFactArgs;
    const results = await client.getSingleFact(max_length);

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
 * Handles get_cat_facts tool calls
 * @param {CatFactsClient} client - Cat Facts API client instance
 * @param {unknown} args - Tool call arguments
 * @returns {Promise<CallToolResult>} Tool call result
 */
export async function handleLocalSearchTool(client: CatFactsClient, args: unknown): Promise<CallToolResult> {
  try {
    if (!args) args = {};

    if (!isLocalSearchArgs(args)) {
      throw new Error("Invalid arguments for get_cat_facts");
    }

    const { limit = 5, max_length } = args as GetCatFactsArgs;
    const results = await client.getMultipleFacts(limit, max_length);

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
