-- AlterTable
ALTER TABLE "Diary"
ADD COLUMN "favorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Diary_userId_favorite_archived_idx" ON "Diary"("userId", "favorite", "archived");
