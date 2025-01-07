import { Editor, Notice } from "obsidian";
import { LinkMetadata } from "src/interfaces";
import { EditorExtensions } from "src/editor_enhancements";
import { LinkMetadataService } from "./link_metadata_service";

export class CodeBlockGenerator {
  editor: Editor;
  linkMetadataService: LinkMetadataService;

  constructor(editor: Editor, linkMetadataService: LinkMetadataService) {
    this.editor = editor;
    this.linkMetadataService = linkMetadataService;
  }

  async convertUrlToCodeBlock(url: string): Promise<void> {
    const selectedText = this.editor.getSelection();

    // Generate a unique id for find/replace operations.
    const pasteId = this.createBlockHash();
    const fetchingText = `[Fetching Data#${pasteId}](${url})`;

    // Instantly paste so you don't wonder if paste is broken
    this.editor.replaceSelection(fetchingText);

    const linkMetadata = await this.fetchLinkMetadata(url);

    const text = this.editor.getValue();
    const start = text.indexOf(fetchingText);

    if (start < 0) {
      console.log(`Unable to find text "${fetchingText}" in current editor, bailing out; link ${url}`);
      return;
    }

    const end = start + fetchingText.length;
    const startPos = EditorExtensions.getEditorPositionFromIndex(text, start);
    const endPos = EditorExtensions.getEditorPositionFromIndex(text, end);

    // if failed to link metadata, show notification and revert
    if (!linkMetadata) {
      new Notice("Couldn't fetch link metadata");
      this.editor.replaceRange(selectedText || url, startPos, endPos);
      return;
    }
    this.editor.replaceRange(this.genCodeBlock(linkMetadata), startPos, endPos);
  }

  genCodeBlock(linkMetadata: LinkMetadata): string {
    const codeBlockTexts = ["\n```cardlink"];
    codeBlockTexts.push(`url: ${linkMetadata.url}`);
    codeBlockTexts.push(`title: "${linkMetadata.title}"`);

    if (linkMetadata.description)
      codeBlockTexts.push(`description: "${linkMetadata.description}"`);

    if (linkMetadata.host)
      codeBlockTexts.push(`host: ${linkMetadata.host}`);

    if (linkMetadata.favicon)
      codeBlockTexts.push(`favicon: ${linkMetadata.favicon}`);

    if (linkMetadata.image) codeBlockTexts.push(`image: ${linkMetadata.image}`);

    codeBlockTexts.push("```\n");
    return codeBlockTexts.join("\n");
  }

  private async fetchLinkMetadata(
    url: string
  ): Promise<LinkMetadata | undefined> {
    return await this.linkMetadataService.fetchMetadata(url);
  }

  private createBlockHash(): string {
    let result = "";
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
