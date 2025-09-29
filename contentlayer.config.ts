// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer2/source-files";

export const News = defineDocumentType(() => ({
  name: "News",
  filePathPattern: `**/*.mdx`,          // adaptează dacă ai altă extensie/locație
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    date:  { type: "date",   required: true },
    tags:  { type: "list", of: { type: "string" } },
    cover: { type: "string" },
    source:{ type: "string" },
    excerpt:{ type:"string" }
  },
}))

export default makeSource({
  contentDirPath: "content/news",       // adaptează la structura ta
  documentTypes: [News],
})


