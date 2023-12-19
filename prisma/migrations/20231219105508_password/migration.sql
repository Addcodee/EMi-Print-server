/*
  Warnings:

  - You are about to drop the column `password_confirm` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "password_confirm";
