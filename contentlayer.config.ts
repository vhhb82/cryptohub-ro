import { defineDocumentType, makeSource } from 'contentlayer/source-files';

export const News = defineDocumentType(() => ({
  name: 'News',
  filePathPattern: `news/**/*.mdx`,
  fields: {
    title: { type: 'string', required: true },
    date:  { type: 'date',   required: true },
    cover: { type: 'string', required: false },
    source:{ type: 'string', required: false },
    externalUrl:{ type:'string', required:false },
    tags:  { type: 'list', of: { type: 'string' }, required: false },
  },
  computedFields: {
    // ex: "news/2025/09/test" -> "2025/09/test"
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace(/^news\//, ''),
    },
    // pentru linkuri (identic cu slug aici)
    slugAsParams: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace(/^news\//, ''),
    },
  },
}));

