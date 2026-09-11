import { NextResponse } from 'next/server';
import { naraAnswer } from '@/lib/chat/nara-brain';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query: string = body?.query || body?.message || '';
    const history = Array.isArray(body?.history) ? body.history : [];

    if (!query.trim()) {
      return NextResponse.json({ text: 'Please enter a message.' });
    }

    const result = await naraAnswer(query, history);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { text: "Something went wrong on my end — sorry! Try again in a moment." },
      { status: 500 }
    );
  }
}
