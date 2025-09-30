// contentlayer.config.ts
import { defineDocumentType } from "contentlayer2/source-files";
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
export {
  News
};
//# sourceMappingURL=compiled-contentlayer-config-65IEI5VI.mjs.map
