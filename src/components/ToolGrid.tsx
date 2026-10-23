import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { toolPath } from "@/lib/site";
import { tools, type ToolId } from "@/lib/tools";

export default function ToolGrid({ lang, exclude }: { lang: Locale; exclude?: ToolId }) {
  return (
    <ul className="tool-grid">
      {tools
        .filter((tool) => tool.id !== exclude)
        .map((tool) => (
          <li key={tool.id}>
            <Link href={toolPath(lang, tool)} className="tool-card">
              <span className="tool-icon" aria-hidden="true">{tool.icon}</span>
              <strong>{tool.text[lang].name}</strong>
              <span className="muted small">{tool.text[lang].intro}</span>
            </Link>
          </li>
        ))}
    </ul>
  );
}
