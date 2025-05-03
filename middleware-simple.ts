import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // If the user is not signed in and the current path is not /admin/signin,
    // redirect the user to /admin/signin
    if (!session && req.nextUrl.pathname.startsWith('/admin') && req.nextUrl.pathname !== '/admin/signin') {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/admin/signin';
      return NextResponse.redirect(redirectUrl);
    }

    // If the user is signed in and the current path is /admin/signin,
    // redirect the user to /admin
    if (session && req.nextUrl.pathname === '/admin/signin') {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/admin';
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // Return a basic response in case of error
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}; 