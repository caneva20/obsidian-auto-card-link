import { App, PluginSettingTab, Setting } from "obsidian";

import ObsidianAutoCardLink from "src/main";
import { ProviderConfigSchema } from "./metada_providers/provider_config_schema";
import { ProviderSettings } from "./metada_providers/providers";

export interface ObsidianAutoCardLinkSettings {
  showInMenuItem: boolean;
  enhanceDefaultPaste: boolean;

  providers: { [providerId: string]: { [key: string]: any } };
}

export const DEFAULT_SETTINGS: ObsidianAutoCardLinkSettings = {
  showInMenuItem: true,
  enhanceDefaultPaste: false,

  providers: {},
};

export class ObsidianAutoCardLinkSettingTab extends PluginSettingTab {
  plugin: ObsidianAutoCardLink;

  constructor(app: App, plugin: ObsidianAutoCardLink) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Enhance Default Paste")
      .setDesc(
        "Fetch the link metadata when pasting a url in the editor with the default paste command"
      )
      .addToggle((val) => {
        return val
          .setValue(this.plugin.settings.enhanceDefaultPaste)
          .onChange(async (value) => {
            this.plugin.settings.enhanceDefaultPaste = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Add commands in menu item")
      .setDesc("Whether to add commands in right click menu items")
      .addToggle((val) => {
        return val
          .setValue(this.plugin.settings.showInMenuItem)
          .onChange(async (value) => {
            this.plugin.settings.showInMenuItem = value;
            await this.plugin.saveSettings();
          });
      });

    containerEl.createEl("h4", { text: "Metadata providers" });

    for (let setting of ProviderSettings) {
      const container = this.createProviderSection(containerEl, setting);

      this.createProviderSettings(container, setting.id, setting);
    }
  }

  private createProviderSection(containerEl: HTMLElement, setting: ProviderConfigSchema) {
    const collapsible = containerEl.createEl("details", { cls: "collapsible-section" });
    const summary = collapsible.createEl("summary", { text: `${setting.name} ` });
    const link = summary.createEl("a", { text: `Docs`, href: setting.url, cls: "summary-link" });
    link.target = "_blank"; // Open link in a new tab

    return  collapsible.createEl("div");
  }

  private createProviderSettings(container: HTMLElement, providerId: string, provider: ProviderConfigSchema) {
    Object.entries(provider).forEach(([key, config]) => {
      switch (config.type) {
        case "text":
          new Setting(container)
            .setName(config.label)
            .setDesc(config.description ?? "")
            .addText((text) => {
              text.setPlaceholder(config.defaultValue);
              text.setValue(this.plugin.settings.providers[providerId][key] ?? config.defaultValue);
              text.onChange(async (value) => {
                this.plugin.settings.providers[providerId][key] = value;
                await this.plugin.saveSettings();
              });
            });
          break;

        case "toggle":
          new Setting(container)
            .setName(config.label)
            .setDesc(config.description ?? "")
            .addToggle((toggle) => {
              toggle.setValue(this.plugin.settings.providers[providerId][key] ?? config.defaultValue);
              toggle.onChange(async (value) => {
                this.plugin.settings.providers[providerId][key] = value;
                await this.plugin.saveSettings();
              });
            });
          break;

        case "number":
          new Setting(container)
            .setName(config.label)
            .setDesc(config.description ?? "")
            .addText((text) => {
              text.setPlaceholder(config.defaultValue.toString());
              text.setValue((this.plugin.settings.providers[providerId][key] ?? config.defaultValue).toString());
              text.inputEl.type = "number";
              text.onChange(async (value) => {
                this.plugin.settings.providers[providerId][key] = Number(value);
                await this.plugin.saveSettings();
              });
            });
          break;

        default:
          console.error(`Unsupported config type: ${config.type}`);
      }
    });

  }
}
