import { z } from "zod";

// Database configuration schema!
export const DatabaseConfigSchema = z.object({
  host: z.string().default("localhost"),
  port: z.number().min(1).max(65535).default(5432),
  database: z.string(),
  username: z.string(),
  password: z.string(),
  ssl: z.boolean().default(false),
  maxConnections: z.number().min(1).default(10),
});

// Application configuration schema (combines all configs)
export const AppConfigSchema = z.object({
  environment: z
    .enum(["development", "staging", "production"])
    .default("development"),
  database: DatabaseConfigSchema,
});

// Type exports
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;

// Example dummy configurations
export const exampleDevelopmentConfig: AppConfig = {
  environment: "development",
  database: {
    host: "localhost",
    port: 5432,
    database: "myapp_dev",
    username: "devuser",
    password: "devpass123",
    ssl: false,
    maxConnections: 5,
  },
};

// Utility function to validate and parse configuration
export function parseConfig(config: unknown): AppConfig {
  try {
    return AppConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Configuration validation failed:");
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    }
    throw new Error("Invalid configuration");
  }
}

// Utility function to load config from environment variables
export function loadConfigFromEnv(): Partial<AppConfig> {
  return {
    environment:
      (process.env.NODE_ENV as "development" | "staging" | "production") ||
      "development",
    database: {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME || "myapp",
      username: process.env.DB_USER || "user",
      password: process.env.DB_PASS || "password",
      ssl: process.env.DB_SSL === "true",
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || "10"),
    },
  };
}
