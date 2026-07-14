/**
 * A path to something in /public, with the deployment's base path on the front.
 *
 * next/link and next/image apply `basePath` themselves; a plain <img src="/x.jpg">
 * does not, and on GitHub Pages — where the app lives under /DUBR — an unprefixed
 * /avatar.jpg is a 404 at the domain root. Anything reaching for a file in /public
 * by hand goes through here.
 *
 * Locally the variable is unset and this is the identity function.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  return `${BASE_PATH}${path}`;
}

/** The default avatar, named once so the store and the editor's "revert" cannot
    drift apart on what "no photo chosen" means. */
export const DEFAULT_AVATAR = asset("/avatar.jpg");
