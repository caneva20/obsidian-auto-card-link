import { App, Notice, PluginSettingTab, Setting } from "obsidian";

import ObsidianAutoCardLink from "src/main";

export interface ObsidianAutoCardLinkSettings {
  showInMenuItem: boolean;
  enhanceDefaultPaste: boolean;
  linkPreviewApiKey: string;
}

export const DEFAULT_SETTINGS: ObsidianAutoCardLinkSettings = {
  showInMenuItem: true,
  enhanceDefaultPaste: false,
  linkPreviewApiKey: ""
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
            if (!this.plugin.settings) return;
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
            if (!this.plugin.settings) return;
            this.plugin.settings.showInMenuItem = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("LinkPreview API Key")
      .setDesc("API key for the LinkPreview.net service. Get one at https://my.linkpreview.net/access_keys")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.linkPreviewApiKey || "")
          .onChange(async (value) => {
            const trimmedValue = value.trim();
            if (trimmedValue.length > 0 && trimmedValue.length !== 32) {
              new Notice("LinkPreview API key must be 32 characters long");
              this.plugin.settings.linkPreviewApiKey = "";
            } else {
              this.plugin.settings.linkPreviewApiKey = trimmedValue;
            }
            await this.plugin.saveSettings();
          })
      );
  }
}
