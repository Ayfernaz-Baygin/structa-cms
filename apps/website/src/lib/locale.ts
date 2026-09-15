import { headers } from "next/headers";
import { cache } from "react";

export type Locale = "tr" | "en";
export const getLocale = cache(async (): Promise<Locale> =>
  (await headers()).get("x-structa-locale") === "en" ? "en" : "tr",
);
