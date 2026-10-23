import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { dictionaries, dir, hasLocale, locales } from "@/lib/i18n";
import { siteUrl, toolPath } from "@/lib/site";
import { tools } from "@/lib/tools";
import "../globals.css";

export const dynamicParams = false;
export const generateStaticParams = () => locales.map((lang) => ({ lang }));

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#14161a" },
  ],
};

const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = dictionaries[lang];

  return (
    <html lang={lang} dir={dir(lang)}>
      <head>
        {adClient && (
          <Script
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
          />
        )}
      </head>
      <body>
        <header className="site-header">
          <div className="wrap header-row">
            <Link href={`/${lang}`} className="logo">
              <span aria-hidden="true">⇄</span> {t.siteName}
            </Link>
            <nav className="main-nav">
              <details className="tools-menu">
                <summary>{t.allTools}</summary>
                <ul>
                  {tools.map((tool) => (
                    <li key={tool.id}>
                      <Link href={toolPath(lang, tool)}>
                        <span aria-hidden="true">{tool.icon}</span> {tool.text[lang].name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
              <LanguageSwitcher current={lang} />
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="wrap footer-row">
            <span>{t.footer}</span>
            <Link href={`/${lang}/privacy`}>{t.privacy}</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
