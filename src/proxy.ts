import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Modo "solo votación" (servicio prod del túnel, VOTE_ONLY_MODE=true):
// el público solo ve /votar; el admin entra a /sorteo con Google (la página y sus APIs ya exigen super admin).
const ALLOWED = [
  /^\/votar\/?$/,
  /^\/privacidad\/?$/,
  /^\/sorteo\/?$/,
  /^\/api\/votar\/?$/,
  /^\/api\/auth\//,
  /^\/api\/sorteo\//,
  /^\/images\//,
  /^\/favicon\.ico$/,
];

export function proxy(request: NextRequest) {
  if (process.env.VOTE_ONLY_MODE !== 'true') return NextResponse.next();
  const { pathname } = request.nextUrl;
  if (ALLOWED.some((re) => re.test(pathname))) return NextResponse.next();
  if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'No disponible' }, { status: 404 });
  return NextResponse.redirect(new URL('/votar', request.url));
}

export const config = {
  // todo menos los archivos internos de Next
  matcher: ['/((?!_next/static|_next/image|_next/data).*)'],
};
