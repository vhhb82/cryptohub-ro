import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

type Instrument = {
  rank: number;
  name: string;
  referralUrl: string;
  description: string;
  tags: string[];
  logo: string;
};

export async function POST(req: NextRequest) {
  try {
    // simplu „auth” prin x-api-key, dacă vrei
    const key = req.headers.get('x-api-key') ?? '';
    const required = process.env.NEWS_API_KEY ?? '';
    if (!required || key !== required) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'BLOB token missing' }, { status: 500 });
    }

    const body = (await req.json()) as Instrument;
    if (!body.name || !body.referralUrl) {
      return NextResponse.json({ error: 'name & referralUrl required' }, { status: 400 });
    }

    // 1) citește ce e în Blob acum
    const listUrl = process.env.NEXT_PUBLIC_INSTRUMENTS_URL!;
    const current = await fetch(listUrl).then(r => r.ok ? r.json() : []);

    // 2) adaugă itemul nou
    const updated = Array.isArray(current) ? [...current, body] : [body];

    // 3) scrie la loc în Blob (same key, no random suffix)
    await put('instruments.json', JSON.stringify(updated, null, 2), {
      access: 'public',
      token,
      addRandomSuffix: false,
      contentType: 'application/json',
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? 'error' }, { status: 500 });
  }
}

