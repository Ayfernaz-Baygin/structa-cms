export function localePath(href: string, locale: "tr" | "en") {
  if (
    !href.startsWith("/") ||
    href.startsWith("//") ||
    /^\/(tr|en)(?:\/|\?|#|$)/.test(href) ||
    /^\/(uploads|api|_next)(?:\/|$)/.test(href) ||
    /\.[a-z0-9]+(?:\?|#|$)/i.test(href)
  )
    return href;
  return `/${locale}${href === "/" ? "" : href}`;
}
