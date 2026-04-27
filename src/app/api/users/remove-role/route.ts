import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  void request;
  return NextResponse.json(
    { success: false, message: 'Bu endpoint backend API sozlesmesinden kaldirildi' },
    { status: 410 },
  );
}
