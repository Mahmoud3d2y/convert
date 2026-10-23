# Convert: free online file converter

A free, simple file converter in **English, French and Arabic**, paid for by Google AdSense.

| Tool | Where it runs |
| --- | --- |
| PDF → Word | Server (pdf2docx, with fixes for Arabic, powers and fonts) |
| Word → PDF | Server (LibreOffice) |
| Compress PDF | Server (Ghostscript) |
| Image → PDF | Visitor's browser |
| PNG → JPG | Visitor's browser |
| JPG → PNG | Visitor's browser |

Image tools run in the browser, so they cost nothing to serve. Server tools delete every file
right after the conversion.

Every tool has its own page in each language, for example `/en/pdf-to-word`, `/fr/pdf-en-word`
and `/ar/pdf-to-word`, with hreflang links, a sitemap and FAQ data so Google can index them.
Arabic pages are laid out right to left.

## Run it locally

You need Node 22, plus LibreOffice, Ghostscript and Python 3 for the server tools.

```bash
npm install
pip install -r converter/requirements.txt
npm run dev        # http://localhost:3000
```

## Deploy

The `Dockerfile` builds one image that has everything (Next.js, LibreOffice, Ghostscript and fonts,
including Arabic). Any host that runs Docker works: Render, Railway, Fly.io, or a small VPS.
Start with about 1 GB of RAM.

```bash
docker build -t convert \
  --build-arg NEXT_PUBLIC_SITE_URL=https://your-domain.com \
  --build-arg NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX \
  --build-arg NEXT_PUBLIC_ADSENSE_SLOT_TOP=1234567890 \
  --build-arg NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM=1234567890 \
  .
docker run -p 3000:3000 convert
```

## Turn on Google ads

1. Deploy the site on your own domain first, without AdSense values. Grey "Advertisement"
   boxes show where the ads will go.
2. Apply at <https://www.google.com/adsense>. Google needs a live site with real content,
   plus a privacy page (already included at `/en/privacy`).
3. In AdSense, turn on **Privacy & messaging → European regulations** so visitors from the
   EU/UK see a consent message (required by Google).
4. Once approved, create two display ad units. Set `NEXT_PUBLIC_ADSENSE_CLIENT` and the two slot
   ids, then rebuild. `/ads.txt` is generated automatically from your publisher id.

See `.env.example` for every setting.

## Licences to know about

PDF → Word uses [pdf2docx](https://github.com/dothinking/pdf2docx) (GPL-3.0) and
[PyMuPDF](https://pymupdf.readthedocs.io) (AGPL-3.0). AGPL means that if you run them on a public
website, you must make the website's source code available to its users (for example by keeping
this repository public and linking to it), or buy a commercial PyMuPDF licence from Artifex.

## Add a new tool

Add an entry in `src/lib/tools.ts` with its text in all three languages. Browser tools go in
`src/lib/browser-convert.ts`; server tools go in `src/lib/server-convert.ts`.
