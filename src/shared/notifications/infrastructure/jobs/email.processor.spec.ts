import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { Transporter } from 'nodemailer';
import { EmailProcessor } from './email.processor';
import { EMAIL_TRANSPORTER_TOKEN } from '../providers/email.provider';
import { SendMailOptions } from '../../domain/email.service.interface';
import { getEmailTemplate } from '../../templates';

// Mock the getEmailTemplate function from the templates module
jest.mock('../../templates', () => ({
  getEmailTemplate: jest.fn(),
}));

describe('EmailProcessor', () => {
  let processor: EmailProcessor;
  let mockTransporter: jest.Mocked<Transporter>;
  let mockConfigService: jest.Mocked<ConfigService>;

  // Cast the mocked function to its Jest mock type for type safety
  const mockedGetEmailTemplate = getEmailTemplate as jest.Mock;

  beforeEach(async () => {
    // Create mock objects for dependencies
    const mockTransporterProvider = {
      provide: EMAIL_TRANSPORTER_TOKEN,
      useValue: {
        sendMail: jest.fn(),
      },
    };

    const mockConfigServiceProvider = {
      provide: ConfigService,
      useValue: {
        get: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailProcessor,
        mockTransporterProvider,
        mockConfigServiceProvider,
      ],
    }).compile();

    processor = module.get<EmailProcessor>(EmailProcessor);
    mockTransporter = module.get(EMAIL_TRANSPORTER_TOKEN);
    mockConfigService = module.get(ConfigService);

    // REFACTOR: Em vez de criar um mock manual, espionamos a instância real do logger.
    // Isso é mais robusto e elimina a necessidade de manter um objeto mock complexo.
    jest.spyOn(processor['logger'], 'log').mockImplementation(() => {});
    jest.spyOn(processor['logger'], 'error').mockImplementation(() => {});

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('handleSendMail', () => {
    const mockJob: Job<SendMailOptions> = {
      id: '123',
      data: {
        to: 'test@example.com',
        subject: 'Test Subject',
        template: 'welcome',
        context: { name: 'Tester' },
      },
    } as any;

    it('should process a job and send an email successfully', async () => {
      // Arrange
      const mailFrom = 'noreply@app.com';
      const htmlBody = '<h1>Welcome, Tester!</h1>';

      mockConfigService.get.mockReturnValue(mailFrom);
      mockedGetEmailTemplate.mockReturnValue(htmlBody);
      mockTransporter.sendMail.mockResolvedValue(true);

      // Act
      await processor.handleSendMail(mockJob);

      // Assert
      // CORREÇÃO: As asserções agora apontam para a instância espionada do logger.
      expect(processor['logger'].log).toHaveBeenCalledWith(
        `Processing job ${String(mockJob.id)}: Sending email to ${mockJob.data.to}`,
      );
      expect(mockedGetEmailTemplate).toHaveBeenCalledWith(
        mockJob.data.template,
        mockJob.data.context,
      );
      expect(mockConfigService.get).toHaveBeenCalledWith('MAIL_FROM');
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: mailFrom,
        to: mockJob.data.to,
        subject: mockJob.data.subject,
        html: htmlBody,
      });
      expect(processor['logger'].log).toHaveBeenCalledWith(
        `Job ${String(mockJob.id)} completed: Email sent to ${mockJob.data.to}`,
      );
      expect(processor['logger'].error).not.toHaveBeenCalled();
    });

    it('should log an error and re-throw if sending fails with an Error object', async () => {
      // Arrange
      const error = new Error('SMTP connection failed');
      mockTransporter.sendMail.mockRejectedValue(error);
      mockConfigService.get.mockReturnValue('noreply@app.com');
      mockedGetEmailTemplate.mockReturnValue('<p>Test</p>');

      // Act & Assert
      await expect(processor.handleSendMail(mockJob)).rejects.toThrow(error);

      // Assert logger calls
      expect(processor['logger'].log).toHaveBeenCalledWith(
        `Processing job ${String(mockJob.id)}: Sending email to ${mockJob.data.to}`,
      );
      expect(processor['logger'].error).toHaveBeenCalledWith(
        `Job ${String(mockJob.id)} failed for ${mockJob.data.to}: ${error.message}`,
        error.stack,
      );
      // Ensure the completion log was not called
      expect(processor['logger'].log).not.toHaveBeenCalledWith(
        expect.stringContaining('completed'),
      );
    });

    it('should handle non-Error objects thrown during sendMail', async () => {
      // Arrange
      const errorString = 'Something bad happened';
      mockTransporter.sendMail.mockRejectedValue(errorString);
      mockConfigService.get.mockReturnValue('noreply@app.com');
      mockedGetEmailTemplate.mockReturnValue('<p>Test</p>');

      // Act & Assert
      await expect(processor.handleSendMail(mockJob)).rejects.toBe(errorString);

      // Assert logger calls
      expect(processor['logger'].error).toHaveBeenCalledWith(
        `Job ${String(mockJob.id)} failed for ${mockJob.data.to}: ${errorString}`,
        undefined, // Stack should be undefined for non-Error objects
      );
    });
  });
});
