/*
  Warnings:

  - You are about to drop the column `author` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `author` on the `Thread` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorId` to the `Thread` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "author",
ADD COLUMN     "authorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Thread" DROP COLUMN "author",
ADD COLUMN     "authorId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
