import { LinkMetadata } from "./interfaces";
import { LinkPreviewMetadataProvider } from "./metada_providers/link_preview_metadata_provider";
import ObsidianAutoCardLink from "./main";
import { ObsidianAutoCardLinkSettings } from "./settings";
import { DomParserMetadataProvider } from "./metada_providers/link_metadata_parser";

export class LinkMetadataService {
  plugin: ObsidianAutoCardLink;
  settings: ObsidianAutoCardLinkSettings;

  //Providers
  linkPreviewMetadataProvider: LinkPreviewMetadataProvider;
  domParserMetadataProvider: DomParserMetadataProvider;

  constructor(plugin: ObsidianAutoCardLink) {
    this.plugin = plugin;
    this.settings = plugin.settings;

    this.linkPreviewMetadataProvider = new LinkPreviewMetadataProvider(plugin.settings);
    this.domParserMetadataProvider = new DomParserMetadataProvider();
  }

  public async fetchMetadata(url: string): Promise<LinkMetadata | undefined> {
    if (this.settings.linkPreviewApiKey.length == 32) {
      return await this.linkPreviewMetadataProvider.fetchUrlTitleViaLinkPreview(url);
    }

    return await this.domParserMetadataProvider.parse(url);
  }
}

