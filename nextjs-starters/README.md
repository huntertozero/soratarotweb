# Next.js 15 스타터 킷

Next.js 15 기반 프로덕션 준비 완료 스타터 킷

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-New_York-black)](https://ui.shadcn.com)

## 기술 스택

| 기술 | 버전 | 역할 |
|------|------|------|
| [Next.js](https://nextjs.org) | 15 | App Router, React 19, Turbopack |
| [TypeScript](https://typescriptlang.org) | 5 | 타입 안전성 |
| [Tailwind CSS](https://tailwindcss.com) | v4 | CSS 네이티브 유틸리티 |
| [shadcn/ui](https://ui.shadcn.com) | latest | New-York 스타일 컴포넌트 |
| [next-themes](https://github.com/pacocoursey/next-themes) | 0.4 | 다크 모드 |
| [Supabase](https://supabase.com) | latest | 백엔드 클라이언트 (연결 준비) |

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local`을 열고 Supabase 프로젝트 키를 입력합니다.
키는 [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API에서 확인할 수 있습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

## 프로젝트 구조

```
src/
├── app/
│   ├── error.tsx          # 에러 바운더리 (client)
│   ├── globals.css        # Tailwind v4 진입점 + shadcn CSS 변수
│   ├── layout.tsx         # 루트 레이아웃 (ThemeProvider 포함)
│   ├── loading.tsx        # 전역 로딩 UI
│   ├── not-found.tsx      # 404 페이지
│   └── page.tsx           # 랜딩 데모 페이지
├── components/
│   ├── ui/                # shadcn/ui CLI 관리 컴포넌트
│   └── theme-toggle.tsx   # 다크/라이트 모드 토글
├── hooks/
│   └── use-mounted.ts     # 하이드레이션 안전 훅
├── lib/
│   ├── supabase/
│   │   ├── client.ts      # 브라우저용 Supabase 클라이언트
│   │   └── server.ts      # 서버용 Supabase 클라이언트 (async)
│   └── utils.ts           # cn() 유틸리티 함수
└── types/
    └── database.types.ts  # Supabase 타입 자동생성 플레이스홀더
```

## shadcn/ui 컴포넌트 추가

```bash
# 개별 추가
npx shadcn@latest add <컴포넌트명>

# 예시
npx shadcn@latest add dialog
npx shadcn@latest add input
npx shadcn@latest add table
npx shadcn@latest add form
```

전체 컴포넌트 목록: [ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components)

## Supabase 사용 방법

### Server Component에서

```typescript
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient(); // async 필수 (Next.js 15)
  const { data } = await supabase.from("your_table").select("*");

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

### Client Component에서

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function DataList() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("your_table")
      .select("*")
      .then(({ data }) => setData(data));
  }, []);

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

### 타입 자동 생성

```bash
# PROJECT_REF를 .env.local에 설정 후
npm run types:supabase
```

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | Turbopack 개발 서버 시작 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 시작 |
| `npm run lint` | ESLint 검사 |
| `npm run type-check` | TypeScript 타입 검사 |
| `npm run types:supabase` | Supabase 타입 자동 생성 |

## Vercel 배포

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

배포 시 다음 환경 변수를 Vercel 대시보드에 추가합니다:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
