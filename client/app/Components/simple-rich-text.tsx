import type { ReactNode } from "react";

function inlineContent(value: string): ReactNode[] {
  const parts = value.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, index) => {
    const bold = /^\*\*(.+)\*\*$/.exec(part);
    if (bold) return <strong key={index}>{bold[1]}</strong>;
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      const [, label, href] = link;
      const safeHref = (href.startsWith("/") && !href.startsWith("//")) || href.startsWith("#") || /^(https?:|mailto:|tel:)/i.test(href) ? href : "#";
      const external = /^https?:/i.test(safeHref);
      return <a key={index} href={safeHref} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="font-semibold underline">{label}</a>;
    }
    return part;
  });
}

export default function SimpleRichText({ value, className = "" }: { value: string; className?: string }) {
  const lines = value.split(/\r?\n/);
  const content: ReactNode[] = [];
  let bullets: string[] = [];
  const flushBullets = () => {
    if (bullets.length) {
      content.push(<ul key={`list-${content.length}`} className="list-disc space-y-1 pl-6">{bullets.map((line, index) => <li key={index}>{inlineContent(line)}</li>)}</ul>);
      bullets = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith("- ")) bullets.push(line.slice(2));
    else {
      flushBullets();
      if (line.trim()) content.push(<p key={`text-${content.length}`}>{inlineContent(line)}</p>);
    }
  }
  flushBullets();
  return <div className={`space-y-3 ${className}`}>{content}</div>;
}
