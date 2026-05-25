import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

/**
 * 서버(Server Components, Route Handlers, Server Actions)용 Supabase 클라이언트 팩토리
 *
 * Next.js 15에서 cookies()는 async이므로 이 함수도 async이다.
 * 반드시 await createClient()로 호출해야 한다.
 *
 * setAll의 try/catch: Server Component에서는 쿠키가 읽기 전용이므로
 * set() 호출 시 에러가 발생한다. 이는 안전하게 무시하며,
 * 세션 갱신은 middleware.ts에서 처리된다.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서는 쿠키 쓰기가 불가능하다.
            // 데이터 조회만 하는 경우 이 에러는 무시해도 안전하다.
            // 세션 갱신은 middleware.ts에서 수행된다.
          }
        },
      },
    }
  );
}
