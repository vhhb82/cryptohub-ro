import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { put } from '@vercel/blob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dacă fișierul e în src/data/instruments.json
const localJsonPath = path.resolve(__dirname, '../src/data/instruments.json');

// dacă e în data/instruments.json (rădăcină repo), folosește:
/// const localJsonPath = path.resolve(process.cwd(), 'data/instruments.json');

const token = process.env.BLOB_READ_WRITE_TOKEN!;
if (!token) {
  throw new Error('BLOB_READ_WRITE_TOKEN lipsă în .env.local');
}

const content = await readFile(localJsonPath, 'utf-8');

const res = await put('instruments.json', content, {
  access: 'public',
  token
});

console.log('Upload OK:', res.url);

