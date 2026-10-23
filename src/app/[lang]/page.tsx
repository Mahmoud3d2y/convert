import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import ToolGrid from "@/components/ToolGrid";
import { dictionaries, hasLocale } from "@/lib/i18n";
import { adSlots, alternates, homePath } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = dictionaries[lang];
  return {
    title: t.homeTitle,
    description: t.homeDescription,
    alternates: alternates(homePath, lang),
    openGraph: { title: t.homeTitle, description: t.homeDescription, type: "website" },
  };
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = dictionaries[lang];

  return (
    <>
      <section className="hero">
        <h1>{t.tagline}</h1>
        <p className="muted">{t.homeDescription}</p>
      </section>
      <AdSlot slot={adSlots.top} label={t.advertisement} />
      <h2 className="section-title">{t.allTools}</h2>
      <ToolGrid lang={lang} />
      <AdSlot slot={adSlots.bottom} label={t.advertisement} />
    </>
  );
}
