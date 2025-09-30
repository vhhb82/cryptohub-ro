// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer2/source-files";
var News = defineDocumentType(() => ({
  name: "News",
  filePathPattern: `**/*.mdx`,
  // adaptează dacă ai altă extensie/locație
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    date: { type: "date", required: true },
    tags: { type: "list", of: { type: "string" } },
    cover: { type: "string" },
    source: { type: "string" },
    excerpt: { type: "string" },
    externalUrl: { type: "string" }
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "content/news",
  // adaptează la structura ta
  documentTypes: [News]
});
export {
  News,
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-D6TKGM3Q.mjs.map
