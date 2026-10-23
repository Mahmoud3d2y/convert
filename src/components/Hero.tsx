import FileConverter from "@/components/FileConverter";
import type { Dictionary } from "@/lib/i18n";

/** The coloured band at the top of every converter page, with the upload box in it. */
export default function Hero({
  title,
  subtitle,
  t,
  presetTo,
}: {
  title: string;
  subtitle: string;
  t: Dictionary;
  presetTo?: string;
}) {
  return (
    <section className="hero-band">
      <div className="wrap">
        <h1>{title}</h1>
        <p className="hero-sub">{subtitle}</p>
        <FileConverter t={t} presetTo={presetTo} />
      </div>
    </section>
  );
}
