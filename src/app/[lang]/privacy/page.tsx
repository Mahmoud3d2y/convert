import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dictionaries, hasLocale } from "@/lib/i18n";
import { alternates } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return {
    title: dictionaries[lang].privacyTitle,
    alternates: alternates((l) => `/${l}/privacy`, lang),
  };
}

export default async function Privacy({ params }: PageProps<"/[lang]/privacy">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = dictionaries[lang];
  return (
    <section className="content wrap">
      <h1>{t.privacyTitle}</h1>
      {t.privacyBody.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </section>
  );
}
