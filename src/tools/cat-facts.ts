/**
 * Cat facts tool definitions and handlers
 */

import { CatFactsClient } from '../client.js';
import { ServerConfig, ToolArgs } from '../types.js';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    additionalProperties: boolean;
  };
}

export class CatFactsTool {
  private client: CatFactsClient;

  constructor(config: ServerConfig) {
    this.client = new CatFactsClient(config);
  }

  /**
   * Get tool definitions
   */
  getToolDefinitions(): ToolDefinition[] {
    return [
      {
        name: 'get_cat_fact',
        description: 'Get a random cat fact from catfact.ninja API',
        inputSchema: {
          type: 'object',
          properties: {
            max_length: {
              type: 'number',
              description: 'Maximum length of the cat fact (optional)',
              minimum: 1,
              maximum: 500
            }
          },
          additionalProperties: false
        }
      },
      {
        name: 'get_cat_facts',
        description: 'Get multiple random cat facts from catfact.ninja API',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of cat facts to retrieve (1-100)',
              minimum: 1,
              maximum: 100,
              default: 5
            },
            max_length: {
              type: 'number',
              description: 'Maximum length of each cat fact (optional)',
              minimum: 1,
              maximum: 500
            }
          },
          additionalProperties: false
        }
      }
    ];
  }

  /**
   * Handle tool calls
   */
  async handleToolCall(name: string, args: ToolArgs) {
    // Validate arguments
    const validation = this.client.validateArgs(args);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    switch (name) {
      case 'get_cat_fact':
        return await this.handleGetCatFact(args);
      case 'get_cat_facts':
        return await this.handleGetCatFacts(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async handleGetCatFact(args: ToolArgs) {
    try {
      const data = await this.client.getCatFact(args);
      
      return {
        content: [
          {
            type: 'text',
            text: `🐱 Cat Fact: ${data.fact}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to fetch cat fact: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleGetCatFacts(args: ToolArgs) {
    try {
      const data = await this.client.getCatFacts(args);
      
      const facts = data.data.map((fact, index) => 
        `${index + 1}. ${fact.fact}`
      ).join('\n');
      
      return {
        content: [
          {
            type: 'text',
            text: `🐱 Cat Facts (${data.data.length} facts):\n\n${facts}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to fetch cat facts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}