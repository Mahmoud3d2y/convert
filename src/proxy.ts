import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/lib/i18n";

/** Sends visitors who open "/" to their browser's language. */
export function proxy(request: NextRequest) {
  const accepted = (request.headers.get("accept-language") ?? "")
    .split(",")
    .map((part) => part.split(";")[0].trim().slice(0, 2).toLowerCase());
  const locale = accepted.find((l) => (locales as readonly string[]).includes(l)) ?? defaultLocale;
  return NextResponse.redirect(new URL(`/${locale}`, request.url));
}

export const config = { matcher: "/" };
