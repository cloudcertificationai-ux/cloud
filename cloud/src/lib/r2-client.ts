import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  type PutObjectCommandInput,
  type GetObjectCommandInput,
  type DeleteObjectCommandInput,
  type ListObjectsV2CommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * R2 Configuration interface
 */
interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain: string;
  endpoint: string;
}

/**
 * R2Client wrapper for Cloudflare R2 operations using S3-compatible API
 */
class R2Client {
  private client: S3Client;
  private bucketName: string;
  private publicDomain: string;

  constructor(config: R2Config) {
    this.bucketName = config.bucketName;
    this.publicDomain = config.publicDomain;

    // Initialize S3 client with R2 endpoint
    this.client = new S3Client({
      region: 'auto',
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  /**
   * Generate presigned PUT URL for uploading objects
   */
  async generatePresignedPut(params: {
    key: string;
    contentType: string;
    expiresIn: number;
  }): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: params.key,
      ContentType: params.contentType,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: params.expiresIn,
    });
  }

  /**
   * Generate presigned GET URL for downloading objects
   */
  async generatePresignedGet(params: {
    key: string;
    expiresIn: number;
  }): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: params.key,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: params.expiresIn,
    });
  }

  /**
   * Delete an object from R2
   */
  async deleteObject(key: string): Promise<void> {
    const input: DeleteObjectCommandInput = {
      Bucket: this.bucketName,
      Key: key,
    };

    const command = new DeleteObjectCommand(input);
    await this.client.send(command);
  }

  /**
   * List objects with a given prefix
   */
  async listObjects(prefix: string): Promise<
    Array<{
      key: string;
      size: number;
      lastModified: Date;
    }>
  > {
    const input: ListObjectsV2CommandInput = {
      Bucket: this.bucketName,
      Prefix: prefix,
    };

    const command = new ListObjectsV2Command(input);
    const response = await this.client.send(command);

    if (!response.Contents) {
      return [];
    }

    return response.Contents.map((item) => ({
      key: item.Key || '',
      size: item.Size || 0,
      lastModified: item.LastModified || new Date(),
    }));
  }

  /**
   * Get public URL for an object
   */
  getPublicUrl(key: string): string {
    return `${this.publicDomain}/${key}`;
  }

  getBucketName(): string {
    return this.bucketName;
  }
}

/**
 * Load R2 configuration from environment variables
 */
function loadR2Config(): R2Config {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicDomain = process.env.R2_PUBLIC_DOMAIN;

  if (process.env.NODE_ENV === 'production' && !accountId) {
    console.warn('R2 configuration not available during build. Using placeholder values.');
    return {
      accountId: 'build-placeholder',
      accessKeyId: 'build-placeholder',
      secretAccessKey: 'build-placeholder',
      bucketName: 'build-placeholder',
      publicDomain: 'build-placeholder',
      endpoint: 'https://build-placeholder.r2.cloudflarestorage.com',
    };
  }

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicDomain) {
    throw new Error(
      'Missing required R2 configuration. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_DOMAIN environment variables.'
    );
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicDomain,
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  };
}

let r2ClientInstance: R2Client | null = null;

export function getR2Client(): R2Client {
  if (!r2ClientInstance) {
    const config = loadR2Config();
    r2ClientInstance = new R2Client(config);
  }
  return r2ClientInstance;
}

export { R2Client };
export const r2Client = getR2Client();
