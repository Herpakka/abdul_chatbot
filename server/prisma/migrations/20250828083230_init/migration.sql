-- CreateTable
CREATE TABLE "passprism"."Chats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chatTitle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chats_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "passprism"."Chats" ADD CONSTRAINT "Chats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "passprism"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
