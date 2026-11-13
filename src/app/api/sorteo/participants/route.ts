import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isSuperAdminEmail } from '@/lib/constants';
import { MISSING_DATA_ERROR, loadSorteoData } from '@/lib/sorteo/data';

export async function GET() {
  const session = await auth();
  if (!isSuperAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  const data = await loadSorteoData();
  if (!data) return NextResponse.json({ error: MISSING_DATA_ERROR }, { status: 404 });

  // memberPhones es solo para validar votos en el servidor: no se envía
  const { memberPhones: _omit, ...rest } = data;
  void _omit;
  return NextResponse.json(rest, { headers: { 'Cache-Control': 'no-store' } });
}
