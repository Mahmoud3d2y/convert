import { locales, type Locale } from "./i18n";
import { tools, type Tool } from "./tools";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const adSlots = {
  top: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP,
  bottom: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM,
};

export const homePath = (locale: Locale) => `/${locale}`;
export const toolPath = (locale: Locale, tool: Tool) => `/${locale}/${tool.text[locale].slug}`;

/** hreflang links so Google shows each visitor the page in their language. */
export function alternates(pathFor: (l: Locale) => string, current: Locale) {
  return {
    canonical: `${siteUrl}${pathFor(current)}`,
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, `${siteUrl}${pathFor(l)}`])),
      "x-default": `${siteUrl}${pathFor("en")}`,
    },
  };
}

export const allToolPaths = () =>
  locales.flatMap((l) => tools.map((t) => ({ locale: l, tool: t, path: toolPath(l, t) })));
