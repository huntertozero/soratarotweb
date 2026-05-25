/**
 * Supabase 데이터베이스 타입 정의
 *
 * 이 파일은 Supabase CLI로 자동 생성된다.
 * 아래 명령으로 최신 스키마를 반영할 수 있다:
 *
 *   npx supabase gen types typescript \
 *     --project-id "$PROJECT_REF" \
 *     --schema public \
 *     > src/types/database.types.ts
 *
 * 또는 package.json의 scripts에 추가된 `types:supabase` 명령 사용:
 *   npm run types:supabase
 *
 * PROJECT_REF는 Supabase Dashboard → Settings → General에서 확인 가능하다.
 */

// 타입 자동생성 전 플레이스홀더 — 스키마 연결 후 위 명령으로 덮어쓴다
export type Database = {
  public: {
    Tables: Record<string, never>; // 생성 후: 각 테이블의 Row/Insert/Update 타입
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// 편의 타입 헬퍼 (자동생성 후 활성화됨)
// 사용 예: Tables<"profiles"> → profiles 테이블의 Row 타입
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T] extends { Row: infer R } ? R : never;

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T] extends { Insert: infer I } ? I : never;

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T] extends { Update: infer U } ? U : never;
