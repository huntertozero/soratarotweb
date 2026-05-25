import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

// Geist 폰트 — CSS 변수로 등록, globals.css의 @theme inline에서 Tailwind와 연결
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Next.js Starter",
    template: "%s | Next.js Starter",
  },
  description:
    "Next.js 15 스타터 킷 — Tailwind CSS v4, shadcn/ui, 다크 모드, Supabase 준비",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: next-themes가 class 속성을 직접 수정하므로 필수
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"       // .dark 클래스를 <html>에 추가/제거
          defaultTheme="system"   // 초기 방문 시 OS 설정 반영
          enableSystem            // 시스템 다크 모드 감지 활성화
          disableTransitionOnChange // 테마 전환 시 transition 플래시 방지
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
