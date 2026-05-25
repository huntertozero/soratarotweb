import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

/**
 * 브라우저(클라이언트 컴포넌트)용 Supabase 클라이언트 팩토리
 *
 * "use client" 컴포넌트에서 사용한다.
 * 브라우저 내장 쿠키 스토리지를 통해 세션을 관리한다.
 *
 * 환경 변수 (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
