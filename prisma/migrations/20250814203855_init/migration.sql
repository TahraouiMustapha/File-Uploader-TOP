-- CreateTable
CREATE TABLE "public"."User" (
    "userid" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userid")
);

-- CreateTable
CREATE TABLE "public"."Folder" (
    "folderid" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER,
    "createdDate" TIMESTAMP(3) NOT NULL,
    "userid" INTEGER NOT NULL,
    "parentid" INTEGER,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("folderid")
);

-- CreateTable
CREATE TABLE "public"."File" (
    "fileid" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER,
    "createdDate" TIMESTAMP(3) NOT NULL,
    "userid" INTEGER NOT NULL,
    "folderid" INTEGER,

    CONSTRAINT "File_pkey" PRIMARY KEY ("fileid")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- AddForeignKey
ALTER TABLE "public"."Folder" ADD CONSTRAINT "Folder_userid_fkey" FOREIGN KEY ("userid") REFERENCES "public"."User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Folder" ADD CONSTRAINT "Folder_parentid_fkey" FOREIGN KEY ("parentid") REFERENCES "public"."Folder"("folderid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_userid_fkey" FOREIGN KEY ("userid") REFERENCES "public"."User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_folderid_fkey" FOREIGN KEY ("folderid") REFERENCES "public"."Folder"("folderid") ON DELETE SET NULL ON UPDATE CASCADE;
