-- CreateEnum
CREATE TYPE "ExamQuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER');

-- CreateEnum
CREATE TYPE "ExamDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "ExamPracticeMode" AS ENUM ('SEQUENTIAL', 'RANDOM', 'WRONG_ONLY');

-- CreateEnum
CREATE TYPE "ExamSourceStatus" AS ENUM ('PARSING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "ExamSource" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "contentText" TEXT NOT NULL,
    "contentHash" TEXT,
    "status" "ExamSourceStatus" NOT NULL DEFAULT 'READY',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamKnowledgePoint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "difficulty" "ExamDifficulty" NOT NULL DEFAULT 'MEDIUM',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamKnowledgePoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamQuestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "knowledgePointId" TEXT,
    "type" "ExamQuestionType" NOT NULL,
    "difficulty" "ExamDifficulty" NOT NULL DEFAULT 'MEDIUM',
    "stem" TEXT NOT NULL,
    "optionsJson" JSONB,
    "answerJson" JSONB NOT NULL,
    "explanation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamPracticeSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceId" TEXT,
    "mode" "ExamPracticeMode" NOT NULL,
    "questionOrderJson" JSONB NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 0,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamPracticeSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamAnswer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "knowledgePointId" TEXT,
    "answerJson" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamWrongRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "knowledgePointId" TEXT,
    "wrongCount" INTEGER NOT NULL DEFAULT 1,
    "lastAnswerJson" JSONB,
    "lastWrongAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamWrongRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExamSource_userId_status_createdAt_idx" ON "ExamSource"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ExamSource_userId_contentHash_idx" ON "ExamSource"("userId", "contentHash");

-- CreateIndex
CREATE INDEX "ExamKnowledgePoint_userId_sourceId_orderIndex_idx" ON "ExamKnowledgePoint"("userId", "sourceId", "orderIndex");

-- CreateIndex
CREATE INDEX "ExamKnowledgePoint_userId_difficulty_idx" ON "ExamKnowledgePoint"("userId", "difficulty");

-- CreateIndex
CREATE INDEX "ExamQuestion_userId_sourceId_type_difficulty_idx" ON "ExamQuestion"("userId", "sourceId", "type", "difficulty");

-- CreateIndex
CREATE INDEX "ExamQuestion_knowledgePointId_idx" ON "ExamQuestion"("knowledgePointId");

-- CreateIndex
CREATE INDEX "ExamPracticeSession_userId_mode_createdAt_idx" ON "ExamPracticeSession"("userId", "mode", "createdAt");

-- CreateIndex
CREATE INDEX "ExamPracticeSession_sourceId_idx" ON "ExamPracticeSession"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamAnswer_sessionId_questionId_key" ON "ExamAnswer"("sessionId", "questionId");

-- CreateIndex
CREATE INDEX "ExamAnswer_userId_isCorrect_createdAt_idx" ON "ExamAnswer"("userId", "isCorrect", "createdAt");

-- CreateIndex
CREATE INDEX "ExamAnswer_knowledgePointId_idx" ON "ExamAnswer"("knowledgePointId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamWrongRecord_userId_questionId_key" ON "ExamWrongRecord"("userId", "questionId");

-- CreateIndex
CREATE INDEX "ExamWrongRecord_userId_lastWrongAt_idx" ON "ExamWrongRecord"("userId", "lastWrongAt");

-- CreateIndex
CREATE INDEX "ExamWrongRecord_knowledgePointId_idx" ON "ExamWrongRecord"("knowledgePointId");

-- AddForeignKey
ALTER TABLE "ExamSource" ADD CONSTRAINT "ExamSource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamKnowledgePoint" ADD CONSTRAINT "ExamKnowledgePoint_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ExamSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamKnowledgePoint" ADD CONSTRAINT "ExamKnowledgePoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_knowledgePointId_fkey" FOREIGN KEY ("knowledgePointId") REFERENCES "ExamKnowledgePoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ExamSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamPracticeSession" ADD CONSTRAINT "ExamPracticeSession_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ExamSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamPracticeSession" ADD CONSTRAINT "ExamPracticeSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAnswer" ADD CONSTRAINT "ExamAnswer_knowledgePointId_fkey" FOREIGN KEY ("knowledgePointId") REFERENCES "ExamKnowledgePoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAnswer" ADD CONSTRAINT "ExamAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ExamQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAnswer" ADD CONSTRAINT "ExamAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExamPracticeSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAnswer" ADD CONSTRAINT "ExamAnswer_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ExamSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAnswer" ADD CONSTRAINT "ExamAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamWrongRecord" ADD CONSTRAINT "ExamWrongRecord_knowledgePointId_fkey" FOREIGN KEY ("knowledgePointId") REFERENCES "ExamKnowledgePoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamWrongRecord" ADD CONSTRAINT "ExamWrongRecord_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ExamQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamWrongRecord" ADD CONSTRAINT "ExamWrongRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ExamSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamWrongRecord" ADD CONSTRAINT "ExamWrongRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
