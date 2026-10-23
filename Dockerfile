# Free file converter: Next.js + LibreOffice (Word -> PDF) + pdf2docx (PDF -> Word)
# + Ghostscript (PDF compress)
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# NEXT_PUBLIC_* values are baked into the browser code at build time.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_ADSENSE_CLIENT
ARG NEXT_PUBLIC_ADSENSE_SLOT_TOP
ARG NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM
RUN npm run build

FROM node:22-bookworm-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      libreoffice-writer-nogui ghostscript python3 python3-venv \
      fonts-liberation fonts-crosextra-carlito fonts-crosextra-caladea \
      fonts-dejavu-core fonts-noto-core \
 && rm -rf /var/lib/apt/lists/*
COPY converter/requirements.txt /tmp/requirements.txt
RUN python3 -m venv /opt/py && /opt/py/bin/pip install --no-cache-dir -r /tmp/requirements.txt
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 PYTHON_PATH=/opt/py/bin/python
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY converter ./converter
USER node
EXPOSE 3000
CMD ["node", "server.js"]
