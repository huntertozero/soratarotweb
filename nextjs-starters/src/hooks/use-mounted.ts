import { useEffect, useState } from "react";

/**
 * 컴포넌트가 클라이언트에 마운트된 후에만 true를 반환하는 훅
 *
 * SSR 환경에서 window, localStorage, 또는 CSS 테마 클래스에 의존하는
 * 컴포넌트의 하이드레이션 불일치를 방지하는 표준 패턴이다.
 *
 * 사용 예:
 *   const mounted = useMounted();
 *   if (!mounted) return <Skeleton />;  // SSR 안전 플레이스홀더
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
