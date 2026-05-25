import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 클래스명을 지능적으로 병합하는 유틸리티 함수
 *
 * - clsx: 조건부 클래스명, 배열 처리
 * - twMerge: Tailwind 충돌 해결 (예: p-4 + p-2 → p-2)
 *
 * 모든 shadcn/ui 컴포넌트가 이 함수를 사용한다.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
