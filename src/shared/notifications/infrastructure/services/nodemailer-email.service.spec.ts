import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { NodemailerEmailService } from './nodemailer-email.service';
import { SendMailOptions } from '../../domain/email.service.interface';

// Create a mock implementation for the Bull Queue
const mockEmailQueue = {
  add: jest.fn(),
};

// Create a mock implementation for the Logger methods.
// We'll use these as the implementation for our spies.
const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
};

describe('NodemailerEmailService', () => {
  let service: NodemailerEmailService;
  let queue: Queue;

  beforeEach(async () => {
    // Reset mocks before each test to ensure a clean state
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NodemailerEmailService,
        {
          // Provide the mock queue using the token NestJS uses for injection
          provide: getQueueToken('email-queue'),
          useValue: mockEmailQueue,
        },
      ],
    })
      // REMOVED: .setLogger(mockLogger) is not the right tool for this job.
      .compile();

    service = module.get<NodemailerEmailService>(NodemailerEmailService);
    queue = module.get<Queue>(getQueueToken('email-queue'));

    // REFACTOR: Spy on the actual logger instance inside the service.
    // This is more precise and robust.
    jest.spyOn(service['logger'], 'log').mockImplementation(mockLogger.log);
    jest.spyOn(service['logger'], 'error').mockImplementation(mockLogger.error);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMail', () => {
    const mailOptions: SendMailOptions = {
      to: 'test@example.com',
      subject: 'Test Subject',
      template: 'test-template',
      context: {
        user: 'John Doe',
        actionUrl: 'https://example.com/confirm',
      },
    };

    it('should add a job to the email queue with correct parameters', async () => {
      // Arrange: Mock a successful job addition
      mockEmailQueue.add.mockResolvedValueOnce({ id: 'job-123' });

      // Act
      await service.sendMail(mailOptions);

      // Assert: Verify that the queue's 'add' method was called correctly
      expect(queue.add).toHaveBeenCalledTimes(1);
      expect(queue.add).toHaveBeenCalledWith(
        'send-mail-job', // The job name
        mailOptions, // The job data
        {
          // The specific job options
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );

      // Assert: Verify that the success was logged
      expect(mockLogger.log).toHaveBeenCalledTimes(1); // This will now pass
      expect(mockLogger.log).toHaveBeenCalledWith(
        `Job to send email to ${mailOptions.to} added to queue.`,
      );
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should log an error and not re-throw if adding to the queue fails', async () => {
      // Arrange: Simulate a failure when adding a job to the queue
      const queueError = new Error('Redis connection failed');
      mockEmailQueue.add.mockRejectedValueOnce(queueError);

      // Act & Assert: The method should handle the error gracefully and not throw
      await expect(service.sendMail(mailOptions)).resolves.not.toThrow();

      // Assert: Verify that an error was logged with the correct message and stack
      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to add email job for ${mailOptions.to} to the queue: ${queueError.message}`,
        queueError.stack,
      );

      // Assert: The success log should not have been called
      expect(mockLogger.log).not.toHaveBeenCalled();
    });

    it('should handle non-Error objects thrown by the queue', async () => {
      // Arrange: Simulate a failure where the thrown value is not an Error instance
      const queueErrorString = 'A simple string error';
      mockEmailQueue.add.mockRejectedValueOnce(queueErrorString);

      // Act
      await service.sendMail(mailOptions);

      // Assert: Verify the error was logged correctly
      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      // The stack should be undefined as the thrown object was not an Error
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to add email job for ${mailOptions.to} to the queue: ${queueErrorString}`,
        undefined,
      );
      expect(mockLogger.log).not.toHaveBeenCalled();
    });
  });
});
