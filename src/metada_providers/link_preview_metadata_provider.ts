import { LinkMetadata } from "../interfaces";
import { ObsidianAutoCardLinkSettings } from "../settings";
import { DefaultConfig, ProviderConfigSchema, TextSetting } from "./provider_config_schema";
import { IMetadataProvider } from "./providers";

export const LinkPreviewConfig: ProviderConfigSchema = {
  ...DefaultConfig,
  id: "link-preview",
  name: "Link Preview",
  url: "link-preview.net",
  apiKey: TextSetting("API Key", "", "Get one at https://my.linkpreview.net/access_keys"),
};

interface Config extends DefaultConfig {
  apiKey: string;
}

export class LinkPreviewMetadataProvider implements IMetadataProvider {
  settings: Config;

  constructor(settings: ObsidianAutoCardLinkSettings) {
    this.settings = settings.providers[LinkPreviewConfig.id] as Config;
  }

  public async parse(url: string): Promise<LinkMetadata | undefined> {
    if (!this.settings.enabled) {
      return;
    }

    if (this.settings.apiKey.length !== 32) {
      console.error("LinkPreview API key is not 32 characters long, please check your settings");

      return;
    }

    try {
      const apiEndpoint = `https://api.linkpreview.net/?q=${encodeURIComponent(
        url
      )}`;
      const response = await fetch(apiEndpoint, {
        headers: {
          "X-Linkpreview-Api-Key": this.settings.apiKey,
        },
      });

      const data = await response.json();

      return {
        url: url,
        title: data.title,
        description: data.description,
        host: new URL(url).hostname,
        favicon: undefined,
        image: data.image,
        indent: 0,
      };
    } catch (error) {
      console.error(error);

      return;
    }
  }
}
