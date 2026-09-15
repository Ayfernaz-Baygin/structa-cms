-- CreateTable
CREATE TABLE "PageRevision" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "body" TEXT,
    "status" "PageStatus" NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "sections" JSONB,
    "pageId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageRevision_pageId_idx" ON "PageRevision"("pageId");

-- AddForeignKey
ALTER TABLE "PageRevision" ADD CONSTRAINT "PageRevision_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageRevision" ADD CONSTRAINT "PageRevision_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
