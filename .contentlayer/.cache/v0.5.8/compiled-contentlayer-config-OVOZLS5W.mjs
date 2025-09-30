// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer2/source-files";
var News = defineDocumentType(() => ({
  name: "News",
  filePathPattern: `news/**/*.mdx`,
  fields: {
    title: { type: "string", required: true },
    date: { type: "date", required: true },
    cover: { type: "string", required: false },
    source: { type: "string", required: false },
    externalUrl: { type: "string", required: false },
    tags: { type: "list", of: { type: "string" }, required: false }
  },
  computedFields: {
    // ex: "news/2025/09/test" -> "2025/09/test"
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.replace(/^news\//, "")
    },
    // pentru linkuri (identic cu slug aici)
    slugAsParams: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.replace(/^news\//, "")
    }
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "content",
  documentTypes: [News]
});
export {
  News,
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-OVOZLS5W.mjs.map
