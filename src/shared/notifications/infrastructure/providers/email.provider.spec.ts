import { ConfigService } from '@nestjs/config';
// CORREÇÃO: Importamos FactoryProvider para fazer o cast correto.
import { FactoryProvider, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import {
  EMAIL_TRANSPORTER_TOKEN,
  emailTransporterProvider,
} from './email.provider';

// ---- Mocks ----
// We mock the entire 'nodemailer' library.
jest.mock('nodemailer');

// We mock the Logger from '@nestjs/common'.
// This allows us to spy on its constructor and methods.
const mockLogMethod = jest.fn();
jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'), // Keep other exports from the module
  Logger: jest.fn().mockImplementation(() => ({
    log: mockLogMethod,
  })),
}));

// Create typed mock objects for easier testing
const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;
// CORREÇÃO: A variável MockLogger foi removida, pois era a causa do primeiro erro.
// Usaremos a variável 'Logger' importada diretamente.
// ---- End Mocks ----

describe('emailTransporterProvider', () => {
  // CORREÇÃO: Fazemos o cast do provider para o tipo específico FactoryProvider.
  // Isso resolve todos os erros de acesso a propriedades como 'provide' e 'useFactory'.
  const provider = emailTransporterProvider as FactoryProvider;

  let mockConfigService: {
    get: jest.Mock;
  };

  beforeEach(() => {
    // Reset all mocks before each test to ensure test isolation
    jest.clearAllMocks();

    // Create a fresh mock for ConfigService for each test
    mockConfigService = {
      get: jest.fn(),
    };
  });

  it('should have the correct provider definition', () => {
    expect(provider.provide).toBe(EMAIL_TRANSPORTER_TOKEN);
    expect(typeof provider.useFactory).toBe('function');
    expect(provider.inject).toEqual([ConfigService]);
  });

  it('should create a secure transporter with auth when port is 465', () => {
    // Arrange: Simulate config for a secure connection with credentials
    mockConfigService.get.mockImplementation((key: string) => {
      const config = {
        MAIL_HOST: 'smtp.example.com',
        MAIL_PORT: 465,
        MAIL_USER: 'user@example.com',
        MAIL_PASS: 'password123',
      };
      return config[key];
    });

    // Act: Execute the factory function with the mock config
    provider.useFactory(mockConfigService as any as ConfigService);

    // Assert
    expect(Logger).toHaveBeenCalledWith('EmailProvider(Local)');
    expect(mockLogMethod).toHaveBeenCalledWith(
      'Configuring Nodemailer -> host=smtp.example.com, port=465, secure=true, auth=yes',
    );
    expect(mockedNodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 465,
      secure: true,
      auth: {
        user: 'user@example.com',
        pass: 'password123',
      },
    });
  });

  it('should create a non-secure transporter without auth', () => {
    // Arrange: Simulate config for a non-secure connection without credentials
    mockConfigService.get.mockImplementation((key: string) => {
      const config = {
        MAIL_HOST: 'localhost',
        MAIL_PORT: 1025,
        MAIL_USER: undefined,
        MAIL_PASS: undefined,
      };
      return config[key];
    });

    // Act
    provider.useFactory(mockConfigService as any as ConfigService);

    // Assert
    expect(mockLogMethod).toHaveBeenCalledWith(
      'Configuring Nodemailer -> host=localhost, port=1025, secure=false, auth=no',
    );
    const transportOptions = mockedNodemailer.createTransport.mock.calls[0][0];
    expect(transportOptions).toEqual({
      host: 'localhost',
      port: 1025,
      secure: false,
    });
    // Explicitly check that the 'auth' property is not present
    expect(transportOptions).not.toHaveProperty('auth');
  });

  it('should create a non-secure transporter with auth', () => {
    // Arrange: Simulate config for a non-secure connection (e.g., port 587) with credentials
    mockConfigService.get.mockImplementation((key: string) => {
      const config = {
        MAIL_HOST: 'smtp.example.com',
        MAIL_PORT: 587,
        MAIL_USER: 'user@example.com',
        MAIL_PASS: 'password123',
      };
      return config[key];
    });

    // Act
    provider.useFactory(mockConfigService as any as ConfigService);

    // Assert
    expect(mockLogMethod).toHaveBeenCalledWith(
      'Configuring Nodemailer -> host=smtp.example.com, port=587, secure=false, auth=yes',
    );
    expect(mockedNodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'user@example.com',
        pass: 'password123',
      },
    });
  });

  it('should not include auth if only a user or pass is provided', () => {
    // Arrange: Simulate config with only a username, no password
    mockConfigService.get.mockImplementation((key: string) => {
      const config = {
        MAIL_HOST: 'smtp.example.com',
        MAIL_PORT: 587,
        MAIL_USER: 'user@example.com',
        MAIL_PASS: undefined, // Missing password
      };
      return config[key];
    });

    // Act
    provider.useFactory(mockConfigService as any as ConfigService);

    // Assert
    expect(mockLogMethod).toHaveBeenCalledWith(
      'Configuring Nodemailer -> host=smtp.example.com, port=587, secure=false, auth=no',
    );
    const transportOptions = mockedNodemailer.createTransport.mock.calls[0][0];
    expect(transportOptions).not.toHaveProperty('auth');
  });
});
