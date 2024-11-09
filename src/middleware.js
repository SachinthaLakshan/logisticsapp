import { NextResponse } from 'next/server'

export function middleware(request) {
  const token = request.cookies.get('auth-token')?.value;
  if (token) {
    return NextResponse.next();
    
  } else {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/customerHome', '/companyHome', '/transportProviderHome'],
}