
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config';

export interface StorageConfig {
  region: string;
  bucket: string;
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export class StorageService {
  private _s3: S3Client | null = null;
  private storageConfig: StorageConfig;

  private get s3(): S3Client {
    if (config.r2.useMockStorage) {
      throw new Error("Storage is disabled in mock storage mode. Use mock methods instead.");
    }
    if (!this._s3) {
      if (!this.storageConfig.accessKeyId || !this.storageConfig.secretAccessKey) {
        throw new Error("Cloudflare R2 credentials are not configured. Please set CLOUDFLARE_R2_ACCESS_KEY_ID and CLOUDFLARE_R2_SECRET_ACCESS_KEY.");
      }
      this._s3 = new S3Client({
        region: this.storageConfig.region,
        ...(this.storageConfig.endpoint ? { endpoint: this.storageConfig.endpoint } : {}),
        credentials: {
          accessKeyId: this.storageConfig.accessKeyId,
          secretAccessKey: this.storageConfig.secretAccessKey
        }
      });
    }
    return this._s3;
  }

  constructor(storageConfig: StorageConfig) {
    this.storageConfig = storageConfig;
    if (config.r2.useMockStorage) {
      console.warn("[StorageService] Mock storage mode active. R2 calls will be simulated.");
    }
  }

  private get bucket(): string {
    return this.storageConfig.bucket;
  }

  /**
   * Generate a signed URL for direct client-side upload.
   */
  async getUploadUrl(key: string, contentType: string, expires: number = 3600): Promise<string> {
    if (config.r2.useMockStorage) {
      console.log(`[Storage] MOCK: Generating upload URL for ${key}`);
      return `https://mock-storage.local/upload/${key}?expires=${expires}`;
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      Metadata: {
        'x-amz-meta-uploaded-at': new Date().toISOString()
      }
    });

    return getSignedUrl(this.s3, command, { expiresIn: expires });
  }

  /**
   * Generate a signed URL for secure file access.
   */
  async getDownloadUrl(key: string, expires: number = 3600): Promise<string> {
    if (config.r2.useMockStorage) {
      console.log(`[Storage] MOCK: Generating download URL for ${key}`);
      return `https://picsum.photos/seed/${encodeURIComponent(key)}/1024/1024`;
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key
    });

    return getSignedUrl(this.s3, command, { expiresIn: expires });
  }

  /**
   * Delete a file from storage.
   */
  async deleteFile(key: string): Promise<void> {
    if (config.r2.useMockStorage) {
      console.log(`[Storage] MOCK: Deleting file ${key}`);
      return;
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key
    });

    await this.s3.send(command);
  }

  /**
   * List files in a project folder.
   */
  async listProjectFiles(projectId: string): Promise<string[]> {
    if (config.r2.useMockStorage) {
      console.log(`[Storage] MOCK: Listing files for project ${projectId}`);
      return [`projects/${projectId}/mock-asset-1.png`, `projects/${projectId}/mock-asset-2.jpg`];
    }

    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: `projects/${projectId}/`
    });

    const response = await this.s3.send(command);
    return response.Contents?.map(c => c.Key!).filter(Boolean) || [];
  }

  /**
   * Versioning Support.
   */
  async getFileVersionHistory(key: string) {
    console.log(`[Storage] Fetching versions for ${key}`);
    if (config.r2.useMockStorage) {
      return [{ versionId: 'v1', lastModified: new Date() }];
    }
  }
}

// Singleton instance for the app
export const storageService = new StorageService({
  region: config.r2.region,
  bucket: config.r2.bucket,
  endpoint: config.r2.endpoint,
  accessKeyId: config.r2.accessKeyId,
  secretAccessKey: config.r2.secretAccessKey
});
