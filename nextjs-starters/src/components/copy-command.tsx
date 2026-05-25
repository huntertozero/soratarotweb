"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyCommandProps {
  command: string;
}

/**
 * 터미널 명령어를 표시하고 클립보드에 복사하는 컴포넌트
 */
export function CopyCommand({ command }: CopyCommandProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    // 2초 후 원래 아이콘으로 복귀
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-3 text-sm">
      <span className="select-none text-muted-foreground">$</span>
      <code className="flex-1 font-mono text-foreground">{command}</code>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-7 w-7 shrink-0 transition-colors",
          copied && "text-green-500"
        )}
        onClick={handleCopy}
        aria-label="명령어 복사"
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
