-- CreateTable
CREATE TABLE "jokes" (
    "id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "body" VARCHAR NOT NULL,
    "category" VARCHAR NOT NULL,
    "title" VARCHAR NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jokes_pkey" PRIMARY KEY ("id")
);
