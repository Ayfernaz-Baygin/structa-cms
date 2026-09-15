CREATE TABLE "SiteSettingsTranslation" (
  "id" TEXT NOT NULL,
  "siteSettingsId" TEXT NOT NULL,
  "locale" "Locale" NOT NULL,
  "siteName" TEXT,
  "siteDescription" TEXT,
  "footerText" TEXT,
  "address" TEXT,
  CONSTRAINT "SiteSettingsTranslation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SiteSettingsTranslation_siteSettingsId_fkey" FOREIGN KEY ("siteSettingsId") REFERENCES "SiteSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "SiteSettingsTranslation_siteSettingsId_locale_key" ON "SiteSettingsTranslation"("siteSettingsId", "locale");

INSERT INTO "SiteSettingsTranslation" ("id", "siteSettingsId", "locale", "siteName", "siteDescription", "footerText", "address") SELECT "id", "id", 'tr', "siteName", "siteDescription", "footerText", "address" FROM "SiteSettings";

CREATE TABLE "MenuItemTranslation" (
  "id" TEXT NOT NULL,
  "menuItemId" TEXT NOT NULL,
  "locale" "Locale" NOT NULL,
  "label" TEXT NOT NULL,
  CONSTRAINT "MenuItemTranslation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MenuItemTranslation_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "MenuItemTranslation_menuItemId_locale_key" ON "MenuItemTranslation"("menuItemId", "locale");

INSERT INTO "MenuItemTranslation" ("id", "menuItemId", "locale", "label") SELECT "id", "id", 'tr', "label" FROM "MenuItem";
