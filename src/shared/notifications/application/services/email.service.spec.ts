import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { SendMailOptions } from '../../domain/email.service.interface';
import { NodemailerEmailService } from '../../infrastructure/services/nodemailer-email.service';

// Mock para a fila do Bull.
const mockEmailQueue = {
  add: jest.fn(),
};

// Mock para o Logger.
const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
};

describe('NodemailerEmailService', () => {
  let service: NodemailerEmailService;
  let emailQueue: Queue;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NodemailerEmailService,
        {
          provide: getQueueToken('email-queue'),
          useValue: mockEmailQueue,
        },
      ],
    }).compile();

    service = module.get<NodemailerEmailService>(NodemailerEmailService);
    emailQueue = module.get<Queue>(getQueueToken('email-queue'));

    // Espionando a instância do logger para interceptar as chamadas.
    jest.spyOn(service['logger'], 'log').mockImplementation(mockLogger.log);
    jest.spyOn(service['logger'], 'error').mockImplementation(mockLogger.error);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMail', () => {
    // CORREÇÃO: O mock agora reflete a estrutura real de SendMailOptions,
    // usando 'template' e 'context' em vez de 'text' e 'html'.
    const mailOptions: SendMailOptions = {
      to: 'test@example.com',
      subject: 'Test Subject',
      template: 'test-template',
      context: {
        user: 'John Doe',
        actionUrl: 'https://example.com/confirm',
      },
    };

    it('should add a job to the queue and log a success message', async () => {
      // Arrange
      mockEmailQueue.add.mockResolvedValue({ id: 'job-123' });

      const expectedJobOptions = {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      };

      // Act
      await service.sendMail(mailOptions);

      // Assert
      expect(emailQueue.add).toHaveBeenCalledTimes(1);
      expect(emailQueue.add).toHaveBeenCalledWith(
        'send-mail-job',
        mailOptions,
        expectedJobOptions,
      );

      expect(mockLogger.log).toHaveBeenCalledTimes(1);
      expect(mockLogger.log).toHaveBeenCalledWith(
        `Job to send email to ${mailOptions.to} added to queue.`,
      );
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should log an error and not re-throw if adding to queue fails with an Error object', async () => {
      // Arrange
      const queueError = new Error('Redis connection failed');
      mockEmailQueue.add.mockRejectedValue(queueError);

      // Act & Assert
      await expect(service.sendMail(mailOptions)).resolves.not.toThrow();

      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to add email job for ${mailOptions.to} to the queue: ${queueError.message}`,
        queueError.stack,
      );
      expect(mockLogger.log).not.toHaveBeenCalled();
    });

    it('should log an error correctly if adding to queue fails with a non-Error object', async () => {
      // Arrange
      const queueError = 'A simple string error';
      mockEmailQueue.add.mockRejectedValue(queueError);

      // Act & Assert
      await expect(service.sendMail(mailOptions)).resolves.not.toThrow();

      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to add email job for ${mailOptions.to} to the queue: ${String(
          queueError,
        )}`,
        undefined,
      );
      expect(mockLogger.log).not.toHaveBeenCalled();
    });
  });
});
