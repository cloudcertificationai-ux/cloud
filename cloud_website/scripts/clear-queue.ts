import 'dotenv/config';
import { Queue } from 'bullmq';

async function main() {
  const q = new Queue('transcode', { connection: { host: 'localhost', port: 6379 } });
  await q.obliterate({ force: true });
  console.log('Queue cleared');
  await q.close();
}

main().catch(console.error);
