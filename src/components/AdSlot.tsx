"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

/**
 * One Google AdSense ad unit. Until NEXT_PUBLIC_ADSENSE_CLIENT is set, it shows a
 * grey placeholder so you can see where ads will go.
 */
export default function AdSlot({ slot, label }: { slot?: string; label: string }) {
  useEffect(() => {
    if (!client || !slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers make this throw; the page works fine without ads.
    }
  }, [slot]);

  if (!client || !slot) {
    return (
      <div className="ad placeholder" aria-hidden="true">
        {label}
      </div>
    );
  }

  return (
    <div className="ad">
      <span className="ad-label">{label}</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
