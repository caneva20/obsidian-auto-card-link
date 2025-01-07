import { requestUrl, RequestUrlResponse } from "obsidian";
import { LinkMetadata } from "src/interfaces";
import { DefaultConfig, NumberSetting, ProviderConfigSchema } from "./provider_config_schema";

export const DomParserConfig: ProviderConfigSchema = {
  ...DefaultConfig,
  id: "dom-parser",
  name: "DOM Parser (local)",
  priority: NumberSetting("Priority", 0, "Provider selection priority")
};

export class DomParserMetadataProvider {
  async parse(url: string): Promise<LinkMetadata | undefined> {
    const res = await this.getResponse(url);

    if (!res)
      return;

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(res.text, "text/html");

    const title = this.getTitle(htmlDoc);

    if (!title)
      return;

    const description = this.getDescription(htmlDoc);
    const { hostname } = new URL(url);
    const favicon = await this.getFavicon(htmlDoc);
    const image = await this.getImage(htmlDoc);

    return {
      url: url,
      title: title,
      description: description,
      host: hostname,
      favicon: favicon,
      image: image,
      indent: 0
    };
  }

  private async getResponse(url: string): Promise<RequestUrlResponse | undefined> {
    try {
      const res = await requestUrl(url);

      if (!res.headers["content-type"].includes("text/html"))
        return;

      return res;
    } catch (error) {
      console.warn(`Failed to fetch ${url}`, error);

      return;
    }
  }

  private getTitle(htmlDoc: Document): string | undefined {
    const ogTitle = htmlDoc
      .querySelector("meta[property='og:title']")
      ?.getAttr("content");

    if (ogTitle)
      return this.sanitize(ogTitle);

    const title = htmlDoc.querySelector("title")?.textContent;

    if (title)
      return this.sanitize(title);
  }

  private getDescription(htmlDoc: Document): string | undefined {
    const ogDescription = htmlDoc
      .querySelector("meta[property='og:description']")
      ?.getAttr("content");

    if (ogDescription)
      return this.sanitize(ogDescription);

    const metaDescription = htmlDoc
      .querySelector("meta[name='description']")
      ?.getAttr("content");

    if (metaDescription)
      return this.sanitize(metaDescription);
  }

  private async getFavicon(htmlDoc: Document): Promise<string | undefined> {
    const favicon = htmlDoc
      .querySelector("link[rel='icon']")
      ?.getAttr("href");

    if (favicon)
      return await this.fixImageUrl(favicon);
  }

  private async getImage(htmlDoc: Document): Promise<string | undefined> {
    const ogImage = htmlDoc
      .querySelector("meta[property='og:image']")
      ?.getAttr("content");

    if (ogImage)
      return await this.fixImageUrl(ogImage);
  }

  private async fixImageUrl(url: string | undefined): Promise<string> {
    if (!url)
      return "";

    const { hostname } = new URL(url);
    let image = url;

    // check if image url use double protocol
    if (url && url.startsWith("//")) {
      //   check if url can access via https or http
      const testUrlHttps = `https:${url}`;
      const testUrlHttp = `http:${url}`;

      if (await checkUrlAccessibility(testUrlHttps)) {
        image = testUrlHttps;
      } else if (await checkUrlAccessibility(testUrlHttp)) {
        image = testUrlHttp;
      }
    } else if (url && url.startsWith("/") && hostname) {
      //   check if image url is relative path
      const testUrlHttps = `https://${hostname}${url}`;
      const testUrlHttp = `http://${hostname}${url}`;
      const resUrlHttps = await checkUrlAccessibility(testUrlHttps);
      const resUrlHttp = await checkUrlAccessibility(testUrlHttp);

      //   check if url can access via https or http
      if (resUrlHttps) {
        image = testUrlHttps;
      } else if (resUrlHttp) {
        image = testUrlHttp;
      }
    }

    // check if url is accessible via image element
    async function checkUrlAccessibility(url: string): Promise<boolean> {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    }

    return image;
  }

  private sanitize(str: string | undefined): string | undefined {
    return str?.replace(/\r\n|\n|\r/g, "")
      .replace(/\\/g, "\\\\")
      .replace(/"/g, "\\\"")
      .trim();
  }
}
