import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
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
      <Hero title={t.heroTitle} subtitle={t.heroSubtitle} t={t} />
      <div className="wrap">
        <AdSlot slot={adSlots.top} label={t.advertisement} />
        <Features t={t} />
        <h2 className="section-title">{t.popular}</h2>
        <ToolGrid lang={lang} />
        <AdSlot slot={adSlots.bottom} label={t.advertisement} />
      </div>
    </>
  );
}
