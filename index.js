#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

class CatFactsMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'cat-facts-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
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
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_cat_fact':
            return await this.getCatFact(args);
          case 'get_cat_facts':
            return await this.getCatFacts(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async getCatFact(args = {}) {
    try {
      const { max_length } = args;
      let url = 'https://catfact.ninja/fact';
      
      if (max_length) {
        url += `?max_length=${max_length}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        content: [
          {
            type: 'text',
            text: `🐱 Cat Fact: ${data.fact}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to fetch cat fact: ${error.message}`);
    }
  }

  async getCatFacts(args = {}) {
    try {
      const { limit = 5, max_length } = args;
      let url = `https://catfact.ninja/facts?limit=${limit}`;
      
      if (max_length) {
        url += `&max_length=${max_length}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
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
      throw new Error(`Failed to fetch cat facts: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Cat Facts MCP Server running on stdio');
  }
}

// Start the server
const server = new CatFactsMCPServer();
server.run().catch(console.error);