"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeNames, locales, type Locale } from "@/lib/i18n";
import { findTool } from "@/lib/tools";

/** Links to the same page in the other languages (tool slugs differ per language). */
export default function LanguageSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();
  const rest = pathname.split("/").slice(2);

  const hrefFor = (target: Locale) => {
    if (!rest.length || !rest[0]) return `/${target}`;
    const tool = findTool(current, rest[0]);
    if (tool) return `/${target}/${tool.text[target].slug}`;
    return `/${target}/${rest.join("/")}`;
  };

  return (
    <nav className="langs" aria-label="Language">
      {locales.map((l) => (
        <Link key={l} href={hrefFor(l)} hrefLang={l} aria-current={l === current ? "true" : undefined}>
          {localeNames[l]}
        </Link>
      ))}
    </nav>
  );
}
