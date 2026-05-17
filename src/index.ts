export interface OsConfig {
  name: string;
  port: number;
  defaultTenantId: string;
  databasePath: string;
  nodeEnv: string;
  featureFlags: Record<string, boolean>;
}

export interface LoadOsConfigOptions {
  name: string;
  env?: Record<string, string | undefined>;
  defaultPort?: number;
  defaultDatabasePath?: string;
  required?: string[];
}

export function loadOsConfig(options: LoadOsConfigOptions): OsConfig {
  const env = options.env ?? process.env;
  validateRequiredConfig(env, options.required ?? []);
  return {
    name: options.name,
    port: readNumber(env.PORT, options.defaultPort ?? 3000),
    defaultTenantId: env.DEFAULT_TENANT_ID ?? "demo-tenant",
    databasePath: env.DATABASE_PATH ?? options.defaultDatabasePath ?? `data/${options.name.toLowerCase()}.json`,
    nodeEnv: env.NODE_ENV ?? "development",
    featureFlags: readFeatureFlags(env)
  };
}

export function validateRequiredConfig(env: Record<string, string | undefined>, required: string[]): void {
  const missing = required.filter((key) => !env[key]);
  if (missing.length > 0) throw new Error(`Missing required config: ${missing.join(", ")}`);
}

export function readFeatureFlags(env: Record<string, string | undefined>): Record<string, boolean> {
  const flags: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(env)) {
    if (!key.startsWith("FEATURE_")) continue;
    flags[key.slice("FEATURE_".length).toLowerCase()] = ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
  }
  return flags;
}

function readNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
