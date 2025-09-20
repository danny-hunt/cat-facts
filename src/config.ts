/**
 * Configuration interface for the Cat Facts MCP Server
 * @interface Config
 */
export interface Config {
  /** Cat facts API base URL */
  apiBaseUrl: string;
  /** Port number for HTTP server */
  port: number;
  /** Current environment mode */
  nodeEnv: "development" | "production";
  /** Convenience flag for production environment */
  isProduction: boolean;
}

/**
 * Loads and validates configuration from environment variables
 * @returns {Config} Validated configuration object
 * @throws {Error} If required environment variables are missing
 */
export function loadConfig(): Config {
  const apiBaseUrl = process.env.CAT_FACTS_API_URL || "https://catfact.ninja";

  const nodeEnv = process.env.NODE_ENV === "production" ? "production" : "development";
  const port = parseInt(process.env.PORT || "3002", 10);

  return {
    apiBaseUrl,
    port,
    nodeEnv,
    isProduction: nodeEnv === "production",
  };
}
