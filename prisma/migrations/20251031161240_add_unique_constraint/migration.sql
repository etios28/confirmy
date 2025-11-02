/*
  Warnings:

  - A unique constraint covering the columns `[userId,url]` on the table `Website` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Website_userId_url_key" ON "Website"("userId", "url");
