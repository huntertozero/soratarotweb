"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

/**
 * 전역 에러 바운더리 컴포넌트
 * 예기치 않은 에러 발생 시 사용자에게 친화적인 화면을 보여준다.
 *
 * "use client" 필수 — Next.js App Router 에러 바운더리는 클라이언트 컴포넌트여야 한다.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅 서비스(Sentry 등) 연동 시 여기에 추가
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          문제가 발생했습니다
        </h2>
        <p className="text-muted-foreground">
          예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        {process.env.NODE_ENV === "development" && error.message && (
          <p className="rounded bg-muted px-3 py-2 text-left text-xs font-mono text-muted-foreground">
            {error.message}
          </p>
        )}
      </div>
      <Button onClick={reset}>다시 시도</Button>
    </div>
  );
}
