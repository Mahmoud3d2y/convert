import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import Hero from "@/components/Hero";
import ToolGrid from "@/components/ToolGrid";
import { dictionaries, hasLocale, locales } from "@/lib/i18n";
import { adSlots, alternates, toolPath } from "@/lib/site";
import { findTool, tools } from "@/lib/tools";

export const dynamicParams = false;
export const generateStaticParams = () =>
  locales.flatMap((lang) => tools.map((tool) => ({ lang, tool: tool.text[lang].slug })));

export async function generateMetadata({ params }: PageProps<"/[lang]/[tool]">): Promise<Metadata> {
  const { lang, tool: slug } = await params;
  if (!hasLocale(lang)) return {};
  const tool = findTool(lang, slug);
  if (!tool) return {};
  const text = tool.text[lang];
  return {
    title: text.title,
    description: text.description,
    alternates: alternates((l) => toolPath(l, tool), lang),
    openGraph: { title: text.title, description: text.description, type: "website" },
  };
}

export default async function ToolPage({ params }: PageProps<"/[lang]/[tool]">) {
  const { lang, tool: slug } = await params;
  if (!hasLocale(lang)) notFound();
  const tool = findTool(lang, slug);
  if (!tool) notFound();
  const t = dictionaries[lang];
  const text = tool.text[lang];

  // FAQ structured data helps Google show rich results.
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <Hero title={text.title} subtitle={text.intro} t={t} presetTo={tool.to} />
      <div className="wrap">
        <AdSlot slot={adSlots.top} label={t.advertisement} />

        <section className="content">
          <h2>{t.howItWorks}</h2>
          <ol>
            {t.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <h2>{t.faq}</h2>
          <dl>
            {t.faqs.map((f) => (
              <div key={f.q}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <AdSlot slot={adSlots.bottom} label={t.advertisement} />

        <h2 className="section-title">{t.allTools}</h2>
        <ToolGrid lang={lang} exclude={tool.id} />
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </>
  );
}
