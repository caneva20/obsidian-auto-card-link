import { LinkPreviewConfig } from "./link_preview_metadata_provider";
import { DomParserConfig } from "./link_metadata_parser";
import { LinkMetadata } from "../interfaces";

export const ProviderSettings = [LinkPreviewConfig, DomParserConfig];

export interface IMetadataProvider {
  parse(url: string): Promise<LinkMetadata | undefined>;
}