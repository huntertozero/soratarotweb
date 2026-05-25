"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";

/**
 * 다크/라이트 모드 토글 버튼
 *
 * - useMounted(): 하이드레이션 전에는 disabled 플레이스홀더를 렌더링
 *   (레이아웃 시프트 방지 — null 반환 시 버튼 크기만큼 레이아웃이 달라짐)
 * - resolvedTheme: 'system' 설정일 때도 실제 적용된 값(dark/light)을 반환
 */
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();

  // SSR / 하이드레이션 전: 동일한 크기의 비활성 플레이스홀더
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="테마 전환" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label={`${resolvedTheme === "dark" ? "라이트" : "다크"} 모드로 전환`}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
}
