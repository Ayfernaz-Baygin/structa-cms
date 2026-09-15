CREATE TYPE "Locale" AS ENUM ('tr', 'en');

ALTER TABLE "PageRevision" ADD COLUMN "translations" JSONB;

DROP INDEX "Page_slug_key";

CREATE TABLE "PageTranslation" (
  "id" TEXT NOT NULL,
  "pageId" TEXT NOT NULL,
  "locale" "Locale" NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "body" TEXT,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  CONSTRAINT "PageTranslation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PageTranslation_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "PageTranslation_pageId_locale_key" ON "PageTranslation"("pageId", "locale");

CREATE UNIQUE INDEX "PageTranslation_locale_slug_key" ON "PageTranslation"("locale", "slug");

INSERT INTO "PageTranslation" ("id", "pageId", "locale", "title", "slug", "body", "seoTitle", "seoDescription") SELECT "id", "id", 'tr', "title", "slug", "body", "seoTitle", "seoDescription" FROM "Page";

DROP INDEX "Service_slug_key";

CREATE TABLE "ServiceTranslation" (
  "id" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "locale" "Locale" NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "shortDescription" TEXT,
  "description" TEXT,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  CONSTRAINT "ServiceTranslation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ServiceTranslation_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ServiceTranslation_serviceId_locale_key" ON "ServiceTranslation"("serviceId", "locale");

CREATE UNIQUE INDEX "ServiceTranslation_locale_slug_key" ON "ServiceTranslation"("locale", "slug");

INSERT INTO "ServiceTranslation" ("id", "serviceId", "locale", "title", "slug", "shortDescription", "description", "seoTitle", "seoDescription") SELECT "id", "id", 'tr', "title", "slug", "shortDescription", "description", "seoTitle", "seoDescription" FROM "Service";

DROP INDEX "Project_slug_key";

CREATE TABLE "ProjectTranslation" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "locale" "Locale" NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "shortDescription" TEXT,
  "description" TEXT,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  CONSTRAINT "ProjectTranslation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProjectTranslation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ProjectTranslation_projectId_locale_key" ON "ProjectTranslation"("projectId", "locale");

CREATE UNIQUE INDEX "ProjectTranslation_locale_slug_key" ON "ProjectTranslation"("locale", "slug");

INSERT INTO "ProjectTranslation" ("id", "projectId", "locale", "title", "slug", "shortDescription", "description", "seoTitle", "seoDescription") SELECT "id", "id", 'tr', "title", "slug", "shortDescription", "description", "seoTitle", "seoDescription" FROM "Project";

DROP INDEX "Post_slug_key";

CREATE TABLE "PostTranslation" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "locale" "Locale" NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "excerpt" TEXT,
  "content" TEXT,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  CONSTRAINT "PostTranslation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PostTranslation_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "PostTranslation_postId_locale_key" ON "PostTranslation"("postId", "locale");

CREATE UNIQUE INDEX "PostTranslation_locale_slug_key" ON "PostTranslation"("locale", "slug");

INSERT INTO "PostTranslation" ("id", "postId", "locale", "title", "slug", "excerpt", "content", "seoTitle", "seoDescription") SELECT "id", "id", 'tr', "title", "slug", "excerpt", "content", "seoTitle", "seoDescription" FROM "Post";
