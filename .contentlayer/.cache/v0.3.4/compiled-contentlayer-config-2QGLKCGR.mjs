// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer/source-files";
var News = defineDocumentType(() => ({
  name: "News",
  filePathPattern: `news/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    date: { type: "date", required: true },
    source: { type: "string" },
    externalUrl: { type: "string" },
    cover: { type: "string" },
    tags: { type: "list", of: { type: "string" } }
  },
  computedFields: {
    slug: {
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
//# sourceMappingURL=compiled-contentlayer-config-2QGLKCGR.mjs.map
