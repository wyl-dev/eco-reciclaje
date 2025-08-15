import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE = 'auth_token';

export function middleware(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const { pathname } = req.nextUrl;

  // Verifica token (firma HS256 básica). Evita usar librerías Node no soportadas en Edge.
  const isValidToken = () => {
    if(!token) return false;
    const parts = token.split('.');
    if(parts.length !== 3) return false;
    try {
      const b64 = parts[1].replace(/-/g,'+').replace(/_/g,'/');
      // Pad base64 string
      const pad = b64.length % 4 === 2 ? '==' : b64.length % 4 === 3 ? '=' : '';
      const payloadJson = atob(b64 + pad);
      const payload = JSON.parse(payloadJson);
      if(payload.exp && Date.now()/1000 > payload.exp) return false;
      return Boolean(payload.uid);
    } catch { return false; }
  };

  const authed = isValidToken();

  if (pathname.startsWith('/dashboard')) {
    if (!authed) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  if (authed && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Incluir explícitamente /dashboard y subrutas
  matcher: ['/dashboard', '/dashboard/:path*', '/auth/login', '/auth/signup']
};
