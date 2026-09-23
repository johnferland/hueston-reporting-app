import type { ReactNode } from "react";
import Markdown from "react-markdown";

export function ReportMarkdown({ source }: { source: string }) {
  return (
    <div className="ds-prose">
      <Markdown
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {children as ReactNode}
            </a>
          ),
        }}
      >
        {source}
      </Markdown>
    </div>
  );
}
