/**
 * Migration script to set lesson kind for existing lessons
 * 
 * Requirements:
 * - 20.1: Set kind=VIDEO for lessons with videoUrl
 * - 20.2: Set kind=ARTICLE for lessons without videoUrl
 * 
 * Usage:
 *   npx tsx prisma/migrations/migrate-lesson-kinds.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateLessonKinds() {
  console.log('Starting lesson kind migration...');

  try {
    // Count lessons that need migration
    const lessonsWithVideo = await prisma.lesson.count({
      where: {
        videoUrl: { not: null },
        kind: { not: 'VIDEO' }
      }
    });

    const lessonsWithoutVideo = await prisma.lesson.count({
      where: {
        videoUrl: null,
        kind: { not: 'ARTICLE' }
      }
    });

    console.log(`Found ${lessonsWithVideo} lessons with videoUrl to migrate to VIDEO`);
    console.log(`Found ${lessonsWithoutVideo} lessons without videoUrl to migrate to ARTICLE`);

    // Migrate lessons with videoUrl to VIDEO
    const videoResult = await prisma.lesson.updateMany({
      where: {
        videoUrl: { not: null },
        kind: { not: 'VIDEO' }
      },
      data: {
        kind: 'VIDEO'
      }
    });

    console.log(`✓ Migrated ${videoResult.count} lessons to VIDEO kind`);

    // Migrate lessons without videoUrl to ARTICLE
    const articleResult = await prisma.lesson.updateMany({
      where: {
        videoUrl: null,
        kind: { not: 'ARTICLE' }
      },
      data: {
        kind: 'ARTICLE'
      }
    });

    console.log(`✓ Migrated ${articleResult.count} lessons to ARTICLE kind`);

    // Verify migration
    const totalMigrated = videoResult.count + articleResult.count;
    console.log(`\nMigration complete! Total lessons migrated: ${totalMigrated}`);

    // Show summary
    const kindCounts = await prisma.lesson.groupBy({
      by: ['kind'],
      _count: true
    });

    console.log('\nLesson kind distribution:');
    kindCounts.forEach(({ kind, _count }) => {
      console.log(`  ${kind}: ${_count}`);
    });

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateLessonKinds()
  .then(() => {
    console.log('\n✓ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  });
