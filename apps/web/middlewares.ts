// import * as jose from 'jose'
// import { NextResponse, NextRequest } from 'next/server';

// const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// // Helper: verify JWT access token
// async function verifyToken(token: string) {
//   return await jose.jwtVerify(token, JWT_SECRET);
// }

// export async function middleware(req: NextRequest) {
//   const token = req.cookies.get('accessToken')?.value;

//   if (!token) {
//     return NextResponse.redirect(new URL('/signin', req.url));
//   }

//   try {
//     // ✅ Try verifying access token
//     await verifyToken(token);
//     return NextResponse.next();
//   } catch (error) {
//     console.warn('[Middleware] Access token invalid or expired:', error);

//     // ❌ Try refreshing the token via backend refresh endpoint
//     try {
//       const refreshResponse = await fetch(`${req.nextUrl.origin}/api/auth/refresh`, {
//         method: 'POST',
//         headers: {
//           Cookie: req.headers.get('cookie') || '',
//         },
//       });

//       if (!refreshResponse.ok) {
//         throw new Error('Refresh failed');
//       }

//       // ⚠️ Note: Next.js middleware can't modify cookies,
//       // but backend can send updated access token via Set-Cookie
//       return NextResponse.next();
//     } catch (refreshError) {
//       console.error('[Middleware] Refresh failed:', refreshError);
//       return NextResponse.redirect(new URL('/signin', req.url));
//     }
//   }
// }
