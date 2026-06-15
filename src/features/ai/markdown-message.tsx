"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownMessage({ content }: { content: string }) {
  return (
    <article className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted prose-strong:text-foreground prose-code:text-foreground prose-a:text-accent">
      <ReactMarkdown
        components={{
          code({ children, className, ...props }) {
            const language = /language-(\w+)/.exec(className ?? "")?.[1];

            return (
              <code
                className={className}
                data-language={language}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre({ children }) {
            return (
              <pre className="overflow-x-auto rounded-md border border-line bg-background p-3 text-xs leading-6">
                {children}
              </pre>
            );
          },
        }}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
