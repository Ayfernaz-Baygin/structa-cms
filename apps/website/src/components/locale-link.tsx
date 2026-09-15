"use client";
import Link from "next/link";
import {
  createContext,
  useContext,
  type ComponentProps,
  type ReactNode,
} from "react";
import { localePath } from "@/lib/locale-path";

const LocaleContext = createContext<"tr" | "en">("tr");
export function LocaleProvider({
  locale,
  children,
}: {
  locale: "tr" | "en";
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}
export default function LocaleLink({
  href,
  ...props
}: ComponentProps<typeof Link>) {
  const locale = useContext(LocaleContext);
  const localized = typeof href === "string" ? localePath(href, locale) : href;
  return <Link {...props} href={localized} />;
}
