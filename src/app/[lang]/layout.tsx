import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { dictionaries, dir, hasLocale, locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";
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
            <LanguageSwitcher current={lang} />
          </div>
        </header>
        <main className="wrap">{children}</main>
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
