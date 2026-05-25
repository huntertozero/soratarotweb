import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { CopyCommand } from "@/components/copy-command";
import { Zap, Layers, Palette, Database } from "lucide-react";

// 스택 소개 카드 데이터
const features = [
  {
    icon: Zap,
    title: "Next.js 15",
    description:
      "App Router, React 19, Turbopack 개발 서버, 비동기 Request API 지원.",
  },
  {
    icon: Palette,
    title: "Tailwind CSS v4",
    description:
      "CSS 네이티브 @theme 설정. tailwind.config.ts 파일이 필요 없음.",
  },
  {
    icon: Layers,
    title: "shadcn/ui",
    description:
      "New-York 스타일 컴포넌트. OKLCH 컬러, 완전한 다크 모드 지원.",
  },
  {
    icon: Database,
    title: "Supabase",
    description:
      "@supabase/ssr 기반 브라우저·서버 클라이언트 유틸리티 포함.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              Next Starter
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 히어로 */}
      <section className="container mx-auto max-w-6xl px-4 py-24 text-center">
        <div className="mb-4 flex justify-center">
          <Badge variant="secondary" className="text-sm">
            프로덕션 준비 완료
          </Badge>
        </div>
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          다음 프로젝트,
          <br />
          <span className="text-muted-foreground">이미 셋업되어 있습니다.</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
          Next.js 15, Tailwind CSS v4, shadcn/ui, 다크 모드, Supabase 클라이언트까지<br /> —
          바로 시작할 수 있는 모던 스타터 킷입니다.
        </p>
        <div className="flex flex-col items-center gap-4">
          <Button size="lg" asChild>
            <a
              href="https://huntertozero.github.io/nextjs-starters/"
              target="_blank"
              rel="noopener noreferrer"
            >
              문서보기
            </a>
          </Button>
          <CopyCommand command="git clone https://github.com/huntertozero/nextjs-starters.git" />
        </div>
      </section>

      {/* 구분선 */}
      <div className="container mx-auto max-w-6xl px-4">
        <Separator />
      </div>

      {/* 기능 그리드 */}
      <section className="container mx-auto max-w-6xl px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
          포함된 기능
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="flex flex-col">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>{description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 컴포넌트 쇼케이스 */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
            컴포넌트 미리보기
          </h2>

          <div className="grid gap-8 md:grid-cols-2">
            {/* 버튼 */}
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>shadcn/ui 버튼 모든 variant</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button disabled>Disabled</Button>
              </CardContent>
            </Card>

            {/* 배지 */}
            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
                <CardDescription>상태 표시 및 레이블 컴포넌트</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </CardContent>
            </Card>

            {/* 다크 모드 */}
            <Card>
              <CardHeader>
                <CardTitle>다크 모드</CardTitle>
                <CardDescription>
                  next-themes + 시스템 설정 자동 감지
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  헤더의 토글 버튼으로 테마를 전환할 수 있습니다.
                  설정은 localStorage에 저장되며, 초기 방문 시 OS 다크 모드를 자동으로 반영합니다.
                </p>
                <ThemeToggle />
              </CardContent>
            </Card>

            {/* Supabase 연결 */}
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>Supabase 연결 준비</CardTitle>
                <CardDescription>클라이언트 유틸리티 미리 구성</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
                    .env.local
                  </code>
                  에{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
                    NEXT_PUBLIC_SUPABASE_URL
                  </code>
                  과{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
                    NEXT_PUBLIC_SUPABASE_ANON_KEY
                  </code>
                  를 추가하면 바로 사용 가능합니다.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Supabase 대시보드 열기
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Next.js 15 · Tailwind CSS v4 · shadcn/ui · Supabase
          </p>
        </div>
      </footer>
    </main>
  );
}
