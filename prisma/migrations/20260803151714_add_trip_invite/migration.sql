-- CreateTable
CREATE TABLE "TripInvite" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "tripId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiredAt" TIMESTAMP(3),

    CONSTRAINT "TripInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TripInvite_token_key" ON "TripInvite"("token");

-- AddForeignKey
ALTER TABLE "TripInvite" ADD CONSTRAINT "TripInvite_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
