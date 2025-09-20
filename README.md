# Cat Facts MCP Server

A Model Context Protocol (MCP) server that provides access to cat facts from the [catfact.ninja](https://catfact.ninja/) API. Built with TypeScript and following modern server architecture patterns.

## Features

- Get a single random cat fact
- Get multiple random cat facts
- Optional length limits for facts
- Built with the official MCP SDK
- TypeScript support with full type safety
- Modular architecture with separate concerns
- Multiple transport options (STDIO and HTTP)
- Comprehensive configuration management
- Command-line interface with argument parsing

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the TypeScript code:
```bash
npm run build
```

## Usage

### Running the Server

Start the MCP server:
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

### Command Line Options

```bash
node dist/index.js [options]

Options:
  --transport, -t <type>    Transport type: stdio or http (default: stdio)
  --port, -p <number>       Port for HTTP transport (default: 3000)
  --host, -h <string>       Host for HTTP transport (default: localhost)
  --help                    Show help message
```

### Available Tools

The server provides two tools:

#### 1. `get_cat_fact`
Retrieves a single random cat fact.

**Parameters:**
- `max_length` (optional): Maximum length of the cat fact (1-500 characters)

**Example:**
```json
{
  "name": "get_cat_fact",
  "arguments": {
    "max_length": 100
  }
}
```

#### 2. `get_cat_facts`
Retrieves multiple random cat facts.

**Parameters:**
- `limit` (optional): Number of cat facts to retrieve (1-100, default: 5)
- `max_length` (optional): Maximum length of each cat fact (1-500 characters)

**Example:**
```json
{
  "name": "get_cat_facts",
  "arguments": {
    "limit": 3,
    "max_length": 150
  }
}
```

## MCP Client Configuration

To use this server with an MCP client, add it to your client configuration:

```json
{
  "mcpServers": {
    "cat-facts": {
      "command": "node",
      "args": ["/path/to/this/directory/dist/index.js"]
    }
  }
}
```

### Environment Variables

The server supports various environment variables for configuration:

- `MCP_TRANSPORT`: Transport type (stdio|http)
- `MCP_PORT`: Port for HTTP transport
- `MCP_HOST`: Host for HTTP transport
- `MCP_SERVER_NAME`: Server name
- `MCP_SERVER_VERSION`: Server version
- `CAT_FACTS_API_URL`: Cat facts API base URL
- `DEFAULT_LIMIT`: Default limit for multiple facts
- `MAX_LIMIT`: Maximum limit for multiple facts
- `MIN_LENGTH`: Minimum fact length
- `MAX_LENGTH`: Maximum fact length

## API Reference

This server uses the [catfact.ninja](https://catfact.ninja/) API:

- **Single fact**: `GET https://catfact.ninja/fact`
- **Multiple facts**: `GET https://catfact.ninja/facts?limit={number}`
- **Length limit**: Add `?max_length={number}` to either endpoint

## Error Handling

The server includes comprehensive error handling for:
- Network connectivity issues
- API rate limiting
- Invalid parameters
- Server errors

## License

MIT