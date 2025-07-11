import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import { Readable } from 'stream';
import { SdkStream } from '@aws-sdk/types';
import { S3Service, UploadFileOptions } from './s3.service';

// Mock a função de nível superior da biblioteca de presigner
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('S3Service', () => {
  let service: S3Service;
  const s3ClientMock = mockClient(S3Client);

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue: any) => {
      if (key === 'AWS_S3_BUCKET_DOCUMENTS') {
        return 'test-documents-bucket';
      }
      if (key === 'AWS_S3_BUCKET_PROFILE_PHOTOS') {
        return 'test-photos-bucket';
      }
      return defaultValue;
    }),
  };

  beforeEach(async () => {
    // Reseta todos os mocks antes de cada teste para garantir isolamento
    s3ClientMock.reset();
    (getSignedUrl as jest.Mock).mockClear();
    mockConfigService.get.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: S3Client,
          useValue: s3ClientMock,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    })
      // Forma correta de suprimir ou mockar o logger no NestJS
      .setLogger({
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        verbose: jest.fn(),
      })
      .compile();

    service = module.get<S3Service>(S3Service);

    // Mock da configuração de região do cliente S3, usada para construir a URL
    (s3ClientMock as any).config = {
      region: jest.fn().mockResolvedValue('us-east-1'),
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload a file and return structured data', async () => {
      const options: UploadFileOptions = {
        key: 'test-file.txt',
        body: 'Hello World',
        contentType: 'text/plain',
        bucket: 'custom-bucket',
        metadata: { 'test-meta': 'value' },
      };

      s3ClientMock.on(PutObjectCommand).resolves({ ETag: '"mock-etag"' });

      const result = await service.uploadFile(options);

      expect(s3ClientMock).toHaveReceivedCommandWith(PutObjectCommand, {
        Bucket: options.bucket,
        Key: options.key,
        Body: options.body,
        ContentType: options.contentType,
        Metadata: options.metadata,
      });

      expect(result).toEqual({
        url: `https://${String(options.bucket)}.s3.us-east-1.amazonaws.com/${options.key}`,
        key: options.key,
        bucket: options.bucket,
        eTag: '"mock-etag"',
      });
    });

    it('should throw an error if S3 upload fails', async () => {
      const error = new Error('S3 Upload Error');
      s3ClientMock.on(PutObjectCommand).rejects(error);
      await expect(
        service.uploadFile({ key: 'fail.txt', body: 'fail' }),
      ).rejects.toThrow(error);
    });
  });

  describe('downloadFile', () => {
    it('should download a file and return it as a buffer', async () => {
      const fileContent = 'this is the file content';
      const fileBuffer = Buffer.from(fileContent);

      // Cria um mock que se comporta como um SdkStream
      const mockStream = new Readable();
      mockStream.push(fileContent);
      mockStream.push(null); // Sinaliza o fim do stream

      // Adiciona o método que o nosso serviço vai usar
      (mockStream as any).transformToByteArray = () =>
        Promise.resolve(fileBuffer);

      s3ClientMock.on(GetObjectCommand).resolves({
        Body: mockStream as SdkStream<Readable>,
      });

      const result = await service.downloadFile({ key: 'test.txt' });

      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toEqual(fileContent);
    });

    it('should throw an error if S3 download fails', async () => {
      const error = new Error('S3 Download Error');
      s3ClientMock.on(GetObjectCommand).rejects(error);
      await expect(service.downloadFile({ key: 'fail.txt' })).rejects.toThrow(
        error,
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete a file and return true on success', async () => {
      s3ClientMock.on(DeleteObjectCommand).resolves({});
      const result = await service.deleteFile({ key: 'test.txt' });
      expect(result).toBe(true);
      expect(s3ClientMock).toHaveReceivedCommandWith(DeleteObjectCommand, {
        Bucket: 'test-documents-bucket',
        Key: 'test.txt',
      });
    });
  });

  describe('fileExists', () => {
    it('should return true if the file exists', async () => {
      s3ClientMock.on(HeadObjectCommand).resolves({});
      const result = await service.fileExists('my-bucket', 'exists.txt');
      expect(result).toBe(true);
    });

    it('should return false if the file does not exist', async () => {
      const notFoundError = new Error('Not Found');
      notFoundError.name = 'NotFound';
      s3ClientMock.on(HeadObjectCommand).rejects(notFoundError);
      const result = await service.fileExists('my-bucket', 'not-exists.txt');
      expect(result).toBe(false);
    });

    it('should re-throw other errors', async () => {
      const otherError = new Error('Access Denied');
      s3ClientMock.on(HeadObjectCommand).rejects(otherError);
      await expect(
        service.fileExists('my-bucket', 'error.txt'),
      ).rejects.toThrow(otherError);
    });
  });

  describe('listFiles', () => {
    it('should return a list of file keys', async () => {
      const files = [{ Key: 'file1.txt' }, { Key: 'file2.png' }];
      s3ClientMock.on(ListObjectsV2Command).resolves({ Contents: files });
      const result = await service.listFiles('list-bucket');
      expect(result).toEqual(['file1.txt', 'file2.png']);
    });
  });

  describe('generatePresignedUploadUrl', () => {
    it('should return a presigned URL with default expiration', async () => {
      const bucket = 'my-bucket';
      const key = 'upload.zip';
      const expiresIn = 3600;
      const mockUrl = 'https://s3.presigned.url/upload';
      (getSignedUrl as jest.Mock).mockResolvedValue(mockUrl);

      const result = await service.generatePresignedUploadUrl(bucket, key);

      expect(result).toBe(mockUrl);
      expect(getSignedUrl).toHaveBeenCalledWith(
        s3ClientMock, // CORREÇÃO: Use a instância de mock específica
        expect.any(PutObjectCommand),
        { expiresIn },
      );
    });

    it('should return a presigned URL with custom expiration', async () => {
      const bucket = 'my-bucket';
      const key = 'upload-custom.zip';
      const expiresIn = 900;
      const mockUrl = 'https://s3.presigned.url/upload-custom';
      (getSignedUrl as jest.Mock).mockResolvedValue(mockUrl);

      const result = await service.generatePresignedUploadUrl(
        bucket,
        key,
        expiresIn,
      );

      expect(result).toBe(mockUrl);
      expect(getSignedUrl).toHaveBeenCalledWith(
        s3ClientMock, // CORREÇÃO: Use a instância de mock específica
        expect.any(PutObjectCommand),
        { expiresIn },
      );
    });
  });

  describe('generatePresignedDownloadUrl', () => {
    it('should return a presigned URL for download', async () => {
      const bucket = 'my-bucket';
      const key = 'download.zip';
      const expiresIn = 3600;
      const mockUrl = 'https://s3.presigned.url/download';
      (getSignedUrl as jest.Mock).mockResolvedValue(mockUrl);

      const result = await service.generatePresignedDownloadUrl(
        bucket,
        key,
        expiresIn,
      );

      expect(result).toBe(mockUrl);
      expect(getSignedUrl).toHaveBeenCalledWith(
        s3ClientMock, // CORREÇÃO: Use a instância de mock específica
        expect.any(GetObjectCommand),
        { expiresIn },
      );
    });
  });

  describe('uploadProfilePhoto', () => {
    it('should call uploadFile with correct parameters', async () => {
      const uploadFileSpy = jest
        .spyOn(service, 'uploadFile')
        .mockResolvedValue({
          url: 'http://mock.url/photo.jpg',
          key: 'profiles/user-123/photo.jpg',
          bucket: 'test-photos-bucket',
          eTag: '"etag"',
        });

      const resultUrl = await service.uploadProfilePhoto(
        'user-123',
        Buffer.from('photodata'),
        'image/jpeg',
      );

      expect(resultUrl).toBe('http://mock.url/photo.jpg');
      expect(uploadFileSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          bucket: 'test-photos-bucket',
          key: 'profiles/user-123/photo.jpg',
          contentType: 'image/jpeg',
        }),
      );
      uploadFileSpy.mockRestore();
    });
  });

  describe('uploadDocument', () => {
    it('should call uploadFile with correct parameters and a timestamped key', async () => {
      const uploadFileSpy = jest
        .spyOn(service, 'uploadFile')
        .mockResolvedValue({
          url: 'http://mock.url/doc.pdf',
          key: 'documents/tenant-abc/invoice/12345.pdf',
          bucket: 'test-documents-bucket',
          eTag: '"etag"',
        });

      const resultUrl = await service.uploadDocument(
        'tenant-abc',
        'invoice',
        Buffer.from('docdata'),
        'application/pdf',
      );

      expect(resultUrl).toBe('http://mock.url/doc.pdf');
      expect(uploadFileSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          bucket: 'test-documents-bucket',
          key: expect.stringMatching(
            /^documents\/tenant-abc\/invoice\/\d+\.pdf$/,
          ),
          contentType: 'application/pdf',
        }),
      );
      uploadFileSpy.mockRestore();
    });
  });
});
