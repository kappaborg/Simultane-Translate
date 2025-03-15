import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Bu middleware her istekte çalıştırılacak
export function middleware(request: NextRequest) {
  // URL'i alın
  const url = request.nextUrl.clone();
  
  // Mevcut istekle devam edin
  return NextResponse.next();
}

// Bu middleware sadece belirtilen path'lerde çalışacak
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API rotaları)
     * - _next/static (statik dosyalar)
     * - _next/image (resim optimizasyonu)
     * - favicon.ico (favicon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 