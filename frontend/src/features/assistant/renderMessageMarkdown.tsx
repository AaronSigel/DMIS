import DOMPurify from "dompurify";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export function renderMessageMarkdown(content: string) {
  const hasRawHtmlTag = /<\/?[a-z][\s\S]*>/i.test(content);
  const safeContent = hasRawHtmlTag ? DOMPurify.sanitize(content) : content;

  return (
    <div className="m-0 break-words text-[13px] leading-[1.5] text-text">
      <ReactMarkdown
        rehypePlugins={hasRawHtmlTag ? [rehypeRaw] : undefined}
        components={{
          p: ({ children }) => <p className="mb-2 mt-0 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="my-2 list-disc pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 list-decimal pl-5">{children}</ol>,
          li: ({ children }) => <li className="my-0.5">{children}</li>,
          code: ({ children }) => (
            <code className="rounded bg-surface px-1 py-0.5 text-[12px]">{children}</code>
          ),
          pre: ({ children }) => <pre className="my-2 overflow-x-auto">{children}</pre>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
}
