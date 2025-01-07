import { LinkMetadata } from "./interfaces";
import { LinkPreviewConfig, LinkPreviewMetadataProvider } from "./metada_providers/link_preview_metadata_provider";
import ObsidianAutoCardLink from "./main";
import { ObsidianAutoCardLinkSettings } from "./settings";
import { DomParserConfig, DomParserMetadataProvider } from "./metada_providers/link_metadata_parser";
import { IMetadataProvider } from "./metada_providers/providers";
import { DefaultConfig } from "./metada_providers/provider_config_schema";

export class LinkMetadataService {
  plugin: ObsidianAutoCardLink;
  settings: ObsidianAutoCardLinkSettings;

  providers: Map<IMetadataProvider, DefaultConfig> = new Map();

  constructor(plugin: ObsidianAutoCardLink) {
    this.plugin = plugin;
    this.settings = plugin.settings;

    this.providers.set(new LinkPreviewMetadataProvider(plugin.settings), this.settings.providers[LinkPreviewConfig.id] as DefaultConfig);
    this.providers.set(new DomParserMetadataProvider(), this.settings.providers[DomParserConfig.id] as DefaultConfig);
  }

  public async fetchMetadata(url: string): Promise<LinkMetadata | undefined> {
    for (let provider of this.getProviders()) {
      console.debug(`Checking provider for metadata`, provider)

      const metadata = await provider.parse(url);

      if (metadata) {
        console.log("Metadata provided by", provider, metadata);

        return metadata;
      }
    }

    console.warn(`No provider could extract data from ${url}`);

    return;
  }

  private getProviders(): IMetadataProvider[] {
    return Array.from(this.providers.entries())
      .filter(([, v]) => v.enabled)
      .sort(([, v]) => v.priority)
      .map(([k]) => k);
  }
}

