/**
 * Command-line argument parsing
 */

import { CliArgs } from './types.js';

export function parseCliArgs(): CliArgs {
  const args: CliArgs = {};
  
  for (let i = 0; i < process.argv.length; i++) {
    const arg = process.argv[i];
    
    switch (arg) {
      case '--transport':
      case '-t':
        args.transport = process.argv[++i] as 'stdio' | 'http';
        break;
      case '--port':
      case '-p':
        args.port = parseInt(process.argv[++i]);
        break;
      case '--host':
      case '-h':
        args.host = process.argv[++i];
        break;
      case '--help':
        args.help = true;
        break;
    }
  }
  
  return args;
}

export function printHelp() {
  console.log(`
Cat Facts MCP Server

Usage: node dist/index.js [options]

Options:
  --transport, -t <type>    Transport type: stdio or http (default: stdio)
  --port, -p <number>       Port for HTTP transport (default: 3000)
  --host, -h <string>       Host for HTTP transport (default: localhost)
  --help                    Show this help message

Environment Variables:
  MCP_TRANSPORT             Transport type (stdio|http)
  MCP_PORT                  Port for HTTP transport
  MCP_HOST                  Host for HTTP transport
  MCP_SERVER_NAME           Server name
  MCP_SERVER_VERSION        Server version
  CAT_FACTS_API_URL         Cat facts API base URL
  DEFAULT_LIMIT             Default limit for multiple facts
  MAX_LIMIT                 Maximum limit for multiple facts
  MIN_LENGTH                Minimum fact length
  MAX_LENGTH                Maximum fact length

Examples:
  node dist/index.js                    # Run with stdio transport
  node dist/index.js --transport http   # Run with HTTP transport
  node dist/index.js -t http -p 8080   # Run HTTP transport on port 8080
`);
}