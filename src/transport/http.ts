/**
 * HTTP transport (streamable HTTP with session management)
 */

import { createServer, IncomingMessage, ServerResponse } from "http";
import { randomUUID } from "crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { TransportConfig } from "../types.js";

type SessionRecord = { transport: StreamableHTTPServerTransport; server: Server };

export class HttpTransport {
  private config: TransportConfig;
  private sessions = new Map<string, SessionRecord>();

  constructor(config: TransportConfig) {
    this.config = config;
  }

  /**
   * Start the HTTP transport server. A factory is provided to create a new MCP Server per session.
   */
  async start(createStandaloneServer: () => Server) {
    const httpServer = createServer();

    httpServer.on("request", async (req, res) => {
      const url = new URL(req.url || "/", `http://${req.headers.host}`);

      switch (url.pathname) {
        case "/mcp":
          await this.handleMcpRequest(req, res, createStandaloneServer);
          break;
        case "/health":
          this.handleHealthCheck(res);
          break;
        default:
          this.handleNotFound(res);
      }
    });

    const isProduction = process.env.NODE_ENV === "production";
    const host = this.config.host ?? (isProduction ? "0.0.0.0" : "localhost");
    const port = this.config.port ?? 3000;

    await new Promise<void>((resolve) => {
      httpServer.listen(port, host, () => resolve());
    });

    const displayUrl = isProduction ? `Port ${port}` : `http://localhost:${port}`;
    console.log(`Cat Facts MCP Server listening on ${displayUrl}`);

    if (!isProduction) {
      console.log("Put this in your client config:");
      console.log(
        JSON.stringify(
          {
            mcpServers: {
              "cat-facts": {
                url: `http://localhost:${port}/mcp`,
              },
            },
          },
          null,
          2
        )
      );
    }
  }

  private async handleMcpRequest(
    req: IncomingMessage,
    res: ServerResponse,
    createStandaloneServer: () => Server
  ): Promise<void> {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    if (sessionId) {
      const session = this.sessions.get(sessionId);
      if (!session) {
        res.statusCode = 404;
        res.end("Session not found");
        return;
      }
      return await session.transport.handleRequest(req, res);
    }

    if (req.method === "POST") {
      await this.createNewSession(req, res, createStandaloneServer);
      return;
    }

    res.statusCode = 400;
    res.end("Invalid request");
  }

  private async createNewSession(
    req: IncomingMessage,
    res: ServerResponse,
    createStandaloneServer: () => Server
  ): Promise<void> {
    const serverInstance = createStandaloneServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (newSessionId: string) => {
        this.sessions.set(newSessionId, { transport, server: serverInstance });
        console.log("New Cat Facts session created:", newSessionId);
      },
    });

    transport.onclose = () => {
      if (transport.sessionId) {
        this.sessions.delete(transport.sessionId);
        console.log("Cat Facts session closed:", transport.sessionId);
      }
    };

    try {
      await serverInstance.connect(transport);
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error("Streamable HTTP connection error:", error);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  }

  private handleHealthCheck(res: ServerResponse): void {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "healthy", timestamp: new Date().toISOString() }));
  }

  private handleNotFound(res: ServerResponse): void {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
}
