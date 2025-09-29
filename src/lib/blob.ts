import { list, put } from '@vercel/blob';

export async function readJsonFromBlob<T>(key: string): Promise<T | null> {
  // căutăm dacă există deja un fișier cu cheia respectivă
  const files = await list({ prefix: key });
  const file = files.blobs.find(b => b.pathname === key);
  if (!file) return null;
  const res = await fetch(file.url, { cache: 'no-store' });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

export async function writeJsonToBlob(key: string, data: unknown) {
  const content = JSON.stringify(data, null, 2);
  // suprascrie același fișier (fără sufix random)
  const { url } = await put(key, content, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
  });
  return url;
}
