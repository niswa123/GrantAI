import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verify2FAAndEnable } from '@/lib/two-factor';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { code } = body;

  if (!code || typeof code !== 'string' || code.length !== 6) {
    return NextResponse.json({ error: 'A valid 6-digit code is required.' }, { status: 400 });
  }

  try {
    const success = await verify2FAAndEnable(session.user.id, code);
    if (!success) {
      return NextResponse.json({ error: 'Invalid code. Please try again.' }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: '2FA has been enabled successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
