import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface UploadFileOptions {
  bucket?: string;
  key: string;
  body: Buffer | string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface DownloadFileOptions {
  bucket?: string;
  key: string;
}

export interface DeleteFileOptions {
  bucket?: string;
  key: string;
}

// Utilitário para mapear content-type para extensão
function getExtensionFromContentType(contentType: string): string {
  if (!contentType) return 'bin';
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
    'application/zip': 'zip',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    // Adicione outros mapeamentos conforme necessário
  };
  return map[contentType] || contentType.split('/')[1] || 'bin';
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly defaultBucket: string;

  constructor(
    private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {
    this.defaultBucket = this.configService.get<string>(
      'AWS_S3_BUCKET_DOCUMENTS',
      'protect-sys-documents',
    );
  }

  /**
   * Faz upload de um arquivo para o S3
   */
  async uploadFile(options: UploadFileOptions): Promise<string> {
    const bucket = options.bucket || this.defaultBucket;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: options.key,
      Body: options.body,
      ContentType: options.contentType,
      Metadata: options.metadata,
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`File uploaded successfully: ${bucket}/${options.key}`);
      // Retorna a URL pública padrão do S3 (ajuste se usar domínio customizado)
      return `https://${bucket}.s3.amazonaws.com/${options.key}`;
    } catch (error) {
      this.logger.error(
        `Failed to upload file ${options.key}: ${(error as Error)?.message ?? String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Faz download de um arquivo do S3
   */
  async downloadFile(options: DownloadFileOptions): Promise<Buffer> {
    const bucket = options.bucket || this.defaultBucket;
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: options.key,
    });

    try {
      const response = await this.s3Client.send(command);
      const chunks: Uint8Array[] = [];

      if (response.Body) {
        for await (const chunk of response.Body as any) {
          chunks.push(chunk);
        }
      }

      const buffer = Buffer.concat(chunks);
      this.logger.log(`File downloaded successfully: ${bucket}/${options.key}`);
      return buffer;
    } catch (error) {
      this.logger.error(
        `Failed to download file ${options.key}: ${(error as Error)?.message ?? String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Deleta um arquivo do S3
   */
  async deleteFile(options: DeleteFileOptions): Promise<boolean> {
    const bucket = options.bucket || this.defaultBucket;
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: options.key,
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${bucket}/${options.key}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Falha ao deletar o arquivo ${options.key}: ${(error as Error)?.message ?? String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Verifica se um arquivo existe no S3
   */
  async fileExists(bucket: string, key: string): Promise<boolean> {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      // AWS SDK v3 pode retornar diferentes formatos de erro para "not found"
      if (
        error &&
        typeof error === 'object' &&
        (('name' in error &&
          (error as { name?: string }).name === 'NotFound') ||
          ('$metadata' in error &&
            (error as { $metadata?: { httpStatusCode?: number } }).$metadata
              ?.httpStatusCode === 404) ||
          ('Code' in error &&
            (error as { Code?: string }).Code === 'NotFound') ||
          ('code' in error && (error as { code?: string }).code === 'NotFound'))
      ) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Lista arquivos em um bucket
   */
  async listFiles(bucket: string, prefix?: string): Promise<string[]> {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    });

    try {
      const response = await this.s3Client.send(command);
      const files =
        response.Contents?.map((obj) => obj.Key).filter(Boolean) || [];
      this.logger.log(`Listed ${files.length} files in bucket ${bucket}`);
      return files as string[];
    } catch (error) {
      this.logger.error(
        `Falha ao listar arquivos no bucket ${bucket}: ${(error as Error)?.message ?? String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Gera uma URL pré-assinada para upload
   */
  async generatePresignedUploadUrl(
    bucket: string,
    key: string,
    expiresIn = 3600,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    try {
      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      this.logger.log(`Generated presigned upload URL for ${bucket}/${key}`);
      return url;
    } catch (error) {
      this.logger.error(
        `Falha ao gerar URL de upload pré-assinado: ${(error as Error)?.message ?? String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Gera uma URL pré-assinada para download
   */
  async generatePresignedDownloadUrl(
    bucket: string,
    key: string,
    expiresIn = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    try {
      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      this.logger.log(`Generated presigned download URL for ${bucket}/${key}`);
      return url;
    } catch (error) {
      this.logger.error(
        `Falha ao gerar URL de download pré-assinado: ${(error as Error)?.message ?? String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Upload de foto de perfil
   */
  async uploadProfilePhoto(
    userId: string,
    file: Buffer,
    contentType: string,
  ): Promise<string> {
    const bucket = this.configService.get<string>(
      'AWS_S3_BUCKET_PROFILE_PHOTOS',
      'protect-sys-profile-photos',
    );
    const ext = getExtensionFromContentType(contentType);
    const key = `profiles/${userId}/photo.${ext}`;

    return this.uploadFile({
      bucket,
      key,
      body: file,
      contentType,
      metadata: {
        userId,
        uploadedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Upload de documento
   */
  async uploadDocument(
    tenantId: string,
    documentType: string,
    file: Buffer,
    contentType: string,
  ): Promise<string> {
    const bucket = this.configService.get<string>(
      'AWS_S3_BUCKET_DOCUMENTS',
      'protect-sys-documents',
    );
    const ext = getExtensionFromContentType(contentType);
    const key = `documents/${tenantId}/${documentType}/${Date.now()}.${ext}`;

    return this.uploadFile({
      bucket,
      key,
      body: file,
      contentType,
      metadata: {
        tenantId,
        documentType,
        uploadedAt: new Date().toISOString(),
      },
    });
  }
}
