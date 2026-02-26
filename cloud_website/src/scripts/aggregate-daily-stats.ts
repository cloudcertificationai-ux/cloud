#!/usr/bin/env tsx
// src/scripts/aggregate-daily-stats.ts

/**
 * Standalone script for aggregating daily statistics
 * 
 * Usage:
 *   npm run aggregate-stats              # Aggregate yesterday's stats
 *   npm run aggregate-stats 2024-02-14   # Aggregate specific date
 *   npm run aggregate-stats --range 2024-02-01 2024-02-14  # Aggregate date range
 * 
 * Can be run via:
 * - Manual execution: tsx src/scripts/aggregate-daily-stats.ts
 * - npm script: npm run aggregate-stats
 * - Cron job: 0 0 * * * cd /path/to/app && npm run aggregate-stats
 * - GitHub Actions workflow
 */

import { MonitoringService } from '@/lib/monitoring';

async function main() {
  const args = process.argv.slice(2);

  try {
    // Parse arguments
    if (args.length === 0) {
      // Default: aggregate yesterday's data
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      console.log(`Aggregating statistics for ${yesterday.toISOString().split('T')[0]}`);
      const stats = await MonitoringService.aggregateDailyStatistics(yesterday);
      
      console.log('Statistics aggregated successfully:');
      console.log(JSON.stringify(stats, null, 2));
    } else if (args[0] === '--range' && args.length === 3) {
      // Date range mode
      const startDate = new Date(args[1]);
      const endDate = new Date(args[2]);
      
      console.log(`Aggregating statistics from ${args[1]} to ${args[2]}`);
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = new Date(d).toISOString().split('T')[0];
        console.log(`\nAggregating ${dateStr}...`);
        
        const stats = await MonitoringService.aggregateDailyStatistics(new Date(d));
        console.log(`  Uploads: ${stats.totalUploads}`);
        console.log(`  Transcodes: ${stats.totalTranscodes} (${stats.successfulTranscodes} successful, ${stats.failedTranscodes} failed)`);
        console.log(`  Playback sessions: ${stats.totalPlaybackSessions}`);
        console.log(`  Watch time: ${Math.round(stats.totalWatchTime / 60)} minutes`);
        console.log(`  API requests: ${stats.totalAPIRequests} (${stats.totalAPIErrors} errors)`);
      }
      
      console.log('\nAll statistics aggregated successfully');
    } else if (args.length === 1) {
      // Single date mode
      const targetDate = new Date(args[0]);
      
      console.log(`Aggregating statistics for ${args[0]}`);
      const stats = await MonitoringService.aggregateDailyStatistics(targetDate);
      
      console.log('Statistics aggregated successfully:');
      console.log(JSON.stringify(stats, null, 2));
    } else {
      console.error('Invalid arguments');
      console.error('Usage:');
      console.error('  npm run aggregate-stats              # Aggregate yesterday');
      console.error('  npm run aggregate-stats 2024-02-14   # Aggregate specific date');
      console.error('  npm run aggregate-stats --range 2024-02-01 2024-02-14  # Aggregate range');
      process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Failed to aggregate statistics:', error);
    process.exit(1);
  }
}

main();
