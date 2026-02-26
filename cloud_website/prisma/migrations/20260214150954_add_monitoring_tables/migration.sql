-- CreateTable
CREATE TABLE "TranscodeJobLog" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "errorMessage" TEXT,
    "errorStack" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranscodeJobLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaybackSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "watchTime" INTEGER NOT NULL DEFAULT 0,
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlaybackSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APIErrorLog" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "errorStack" TEXT,
    "userId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "APIErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APIPerformanceLog" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "userId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "APIPerformanceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyStatistics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalUploads" INTEGER NOT NULL DEFAULT 0,
    "totalTranscodes" INTEGER NOT NULL DEFAULT 0,
    "successfulTranscodes" INTEGER NOT NULL DEFAULT 0,
    "failedTranscodes" INTEGER NOT NULL DEFAULT 0,
    "totalPlaybackSessions" INTEGER NOT NULL DEFAULT 0,
    "totalWatchTime" INTEGER NOT NULL DEFAULT 0,
    "averageCompletionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAPIRequests" INTEGER NOT NULL DEFAULT 0,
    "totalAPIErrors" INTEGER NOT NULL DEFAULT 0,
    "averageResponseTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TranscodeJobLog_mediaId_idx" ON "TranscodeJobLog"("mediaId");

-- CreateIndex
CREATE INDEX "TranscodeJobLog_jobId_idx" ON "TranscodeJobLog"("jobId");

-- CreateIndex
CREATE INDEX "TranscodeJobLog_status_idx" ON "TranscodeJobLog"("status");

-- CreateIndex
CREATE INDEX "TranscodeJobLog_startedAt_idx" ON "TranscodeJobLog"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlaybackSession_sessionId_key" ON "PlaybackSession"("sessionId");

-- CreateIndex
CREATE INDEX "PlaybackSession_userId_idx" ON "PlaybackSession"("userId");

-- CreateIndex
CREATE INDEX "PlaybackSession_mediaId_idx" ON "PlaybackSession"("mediaId");

-- CreateIndex
CREATE INDEX "PlaybackSession_lessonId_idx" ON "PlaybackSession"("lessonId");

-- CreateIndex
CREATE INDEX "PlaybackSession_courseId_idx" ON "PlaybackSession"("courseId");

-- CreateIndex
CREATE INDEX "PlaybackSession_startedAt_idx" ON "PlaybackSession"("startedAt");

-- CreateIndex
CREATE INDEX "APIErrorLog_requestId_idx" ON "APIErrorLog"("requestId");

-- CreateIndex
CREATE INDEX "APIErrorLog_statusCode_idx" ON "APIErrorLog"("statusCode");

-- CreateIndex
CREATE INDEX "APIErrorLog_userId_idx" ON "APIErrorLog"("userId");

-- CreateIndex
CREATE INDEX "APIErrorLog_timestamp_idx" ON "APIErrorLog"("timestamp");

-- CreateIndex
CREATE INDEX "APIPerformanceLog_requestId_idx" ON "APIPerformanceLog"("requestId");

-- CreateIndex
CREATE INDEX "APIPerformanceLog_path_idx" ON "APIPerformanceLog"("path");

-- CreateIndex
CREATE INDEX "APIPerformanceLog_userId_idx" ON "APIPerformanceLog"("userId");

-- CreateIndex
CREATE INDEX "APIPerformanceLog_timestamp_idx" ON "APIPerformanceLog"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStatistics_date_key" ON "DailyStatistics"("date");

-- CreateIndex
CREATE INDEX "DailyStatistics_date_idx" ON "DailyStatistics"("date");
