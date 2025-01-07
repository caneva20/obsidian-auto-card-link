export const TextSetting = (label: string, defaultValue: string = "", description: string | undefined = undefined) => ({
  type: "text" as const,
  label,
  description,
  defaultValue
});

export const ToggleSetting = (label: string, defaultValue: boolean = false, description: string | undefined = undefined) => ({
  type: "toggle" as const,
  label,
  description,
  defaultValue
});

export const NumberSetting = (label: string, defaultValue: number = 0, description: string | undefined = undefined) => ({
  type: "number" as const,
  label,
  description,
  defaultValue
});

export const DefaultConfig = {
  enabled: ToggleSetting("Enabled", false),
  priority: NumberSetting("Priority", 100, "Provider selection priority"),
};

export interface DefaultConfig {
  enabled: boolean;
  priority: number;
}

export type ProviderConfigSchema = {
  id: string;
  name: string;
  url?: string;
  [key: string]: any;
};