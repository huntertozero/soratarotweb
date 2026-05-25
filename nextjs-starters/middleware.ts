import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase 세션 갱신 미들웨어
 *
 * 모든 요청에서 Supabase 세션을 확인하고, 만료된 토큰을 자동으로 갱신한다.
 * Server Component에서는 쿠키를 설정할 수 없기 때문에 이 미들웨어가 필수적이다.
 *
 * 주의:
 * - createServerClient 사용 (createBrowserClient가 아님)
 * - request.cookies에서 쿠키를 읽고 supabaseResponse에 쓴다
 * - supabaseResponse를 반환해야 갱신된 쿠키가 클라이언트로 전달된다
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 요청 쿠키 업데이트 (이후 생성될 response에서 사용)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // 갱신된 쿠키를 포함한 새 response 생성
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 세션 갱신 트리거 — getUser()가 만료된 토큰을 자동으로 갱신한다
  // 반환값을 사용하지 않더라도 이 호출은 반드시 필요하다
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 요청에 미들웨어 적용:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화)
     * - favicon.ico, sitemap.xml, robots.txt
     * - 이미지 파일 (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
