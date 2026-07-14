import type { NextConfig } from "next";

/**
 * GitHub Pages serves this project from a SUBPATH — https://jmchiang1.github.io/DUBR/ —
 * so every URL the app emits has to carry the /DUBR prefix. It is read from the
 * environment rather than written here as a literal, because the prefix is a fact
 * about one deployment, not about the app: `next dev` and any root-domain host
 * leave it unset and get "/" back.
 *
 * The Pages workflow sets NEXT_PUBLIC_BASE_PATH=/DUBR. It is NEXT_PUBLIC_ so the
 * client bundle can read it too — a plain <img src="/avatar.jpg"> is NOT rewritten
 * by basePath the way next/link and next/image are, so those paths are prefixed by
 * hand through `asset()` in src/lib/asset.ts.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  /* Pages has no Node server: every route is written out as HTML at build time,
     into ./out. Nothing here needs one — the roster is mock data and the only
     state the app keeps is in localStorage. */
  output: "export",
  basePath,

  /* /players/p1/ resolves to players/p1/index.html on a static host. Without the
     trailing slash the export writes players/p1.html, which Pages serves only from
     the .html URL — so a refresh on an in-app link would 404. */
  trailingSlash: true,

  /* The image optimizer is a server. There isn't one. */
  images: { unoptimized: true },
};

export default nextConfig;
