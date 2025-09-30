'use client';

import * as React from 'react';
import { useMDXComponent } from 'next-contentlayer/hooks';

export default function Mdx({ code }: { code?: string }) {
  const Component = useMDXComponent(code || '');
  // poți adăuga aici mapări de componente MDX -> React (cod, imagini, etc.)
  if (!code) return null;
  return <Component components={{}} />;
}
