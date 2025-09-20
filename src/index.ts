#!/usr/bin/env node

/**
 * Main entry point for the Cat Facts MCP Server
 */

import { CatFactsMCPServer } from './server.js';
import { parseCliArgs, printHelp } from './cli.js';
import { getServerConfig, getTransportConfig } from './config.js';

async function main() {
  const cliArgs = parseCliArgs();
  
  if (cliArgs.help) {
    printHelp();
    process.exit(0);
  }

  // Override config with CLI arguments
  const serverConfig = getServerConfig();
  const transportConfig = getTransportConfig();
  
  if (cliArgs.transport) {
    transportConfig.type = cliArgs.transport;
  }
  if (cliArgs.port) {
    transportConfig.port = cliArgs.port;
  }
  if (cliArgs.host) {
    transportConfig.host = cliArgs.host;
  }

  try {
    const server = new CatFactsMCPServer(serverConfig);
    await server.run(transportConfig);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('\nShutting down Cat Facts MCP Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('\nShutting down Cat Facts MCP Server...');
  process.exit(0);
});

main().catch(console.error);