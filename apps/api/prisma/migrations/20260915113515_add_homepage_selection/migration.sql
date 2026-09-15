-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "homePageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SiteSettings_homePageId_key" ON "SiteSettings"("homePageId");

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_homePageId_fkey" FOREIGN KEY ("homePageId") REFERENCES "Page"("id") ON DELETE SET NULL ON UPDATE CASCADE;
