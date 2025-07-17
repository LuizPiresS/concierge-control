import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Condominium } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  CONDOMINIUM_REPOSITORY_TOKEN,
  ICondominiumRepository,
} from '../../../domain/repositories/condominium.repository.interface';
import { PasswordGeneratorService } from '../../../../../shared/utils/password-generator.service';
import { CreateCondominiumDto } from '../../../presentation/http/dtos/create-condominium.dto';
import {
  EMAIL_SERVICE_TOKEN,
  IEmailService,
} from '../../../../../shared/notifications/domain/email.service.interface';
import { CreateCondominiumUseCase } from './create-condominium.usecase';

// Mock bcrypt
jest.mock('bcrypt');

describe('CreateCondominiumUseCase', () => {
  let useCase: CreateCondominiumUseCase;
  let condominiumRepository: jest.Mocked<ICondominiumRepository>;
  let passwordGenerator: jest.Mocked<PasswordGeneratorService>;
  let emailService: jest.Mocked<IEmailService>;

  const mockCondominiumRepository = {
    findByCnpj: jest.fn(),
    // Add other methods if they are used, with jest.fn()
    findByEmail: jest.fn(),
    createWithManager: jest.fn(),
  };

  const mockPasswordGenerator = {
    generate: jest.fn(),
  };

  const mockEmailService = {
    sendMail: jest.fn(),
  };

  // CORREÇÃO: O DTO agora inclui todos os campos obrigatórios.
  const createCondominiumDto: CreateCondominiumDto = {
    name: 'Condomínio Central',
    cnpj: '12345678000195',
    managerEmail: 'manager@test.com',
    street: 'Rua dos Testes',
    number: '123',
    neighborhood: 'Bairro da Qualidade',
    city: 'Cidade da Simulação',
    state: 'TS',
    zipCode: '12345678',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCondominiumUseCase,
        {
          provide: CONDOMINIUM_REPOSITORY_TOKEN,
          useValue: mockCondominiumRepository,
        },
        {
          provide: PasswordGeneratorService,
          useValue: mockPasswordGenerator,
        },
        {
          provide: EMAIL_SERVICE_TOKEN,
          useValue: mockEmailService,
        },
      ],
    })
      .setLogger(new Logger()) // Suppress logs during tests
      .compile();

    useCase = module.get<CreateCondominiumUseCase>(CreateCondominiumUseCase);
    condominiumRepository = module.get(CONDOMINIUM_REPOSITORY_TOKEN);
    passwordGenerator = module.get(PasswordGeneratorService);
    emailService = module.get(EMAIL_SERVICE_TOKEN);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should create a new condominium and manager user successfully', async () => {
      // Arrange
      const temporaryPassword = 'temp_password_123';
      const hashedPassword = 'hashed_password';
      // CORREÇÃO: Mock da entidade mais realista, sem usar spread do DTO.
      const createdCondo: Condominium = {
        id: 'condo-uuid-123',
        name: createCondominiumDto.name,
        cnpj: createCondominiumDto.cnpj,
        street: createCondominiumDto.street,
        number: createCondominiumDto.number,
        neighborhood: createCondominiumDto.neighborhood,
        city: createCondominiumDto.city,
        state: createCondominiumDto.state,
        zipCode: createCondominiumDto.zipCode,
        complement: null,
        phone: null,
        email: null,
        stateRegistration: null,
        municipalRegistration: null,
        logoUrl: null,
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      condominiumRepository.findByCnpj.mockResolvedValue(null);
      condominiumRepository.findByEmail.mockResolvedValue(null);
      passwordGenerator.generate.mockReturnValue(temporaryPassword);
      emailService.sendMail.mockResolvedValue(undefined);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      // REFATORAÇÃO: Em vez de mockar o Prisma, mockamos o método do repositório.
      condominiumRepository.createWithManager.mockResolvedValue(createdCondo);

      // Act
      const result = await useCase.execute(createCondominiumDto);

      // Assert
      // Verifica se as validações foram chamadas
      expect(condominiumRepository.findByCnpj).toHaveBeenCalledWith(
        createCondominiumDto.cnpj,
      );

      // Verifica a lógica de negócio
      expect(passwordGenerator.generate).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledWith(temporaryPassword, 10);

      // Verifica se a criação foi delegada corretamente ao repositório
      const { managerEmail: _managerEmail, ...condominiumData } =
        createCondominiumDto;
      expect(condominiumRepository.createWithManager).toHaveBeenCalledWith(
        condominiumData,
        { email: createCondominiumDto.managerEmail, hashedPassword },
      );

      // Assert a chamada ao serviço de e-mail
      expect(emailService.sendMail).toHaveBeenCalledWith({
        to: createCondominiumDto.managerEmail,
        subject: `Bem-vindo ao Concierge Control, ${createdCondo.name}!`,
        template: 'welcome-email',
        context: {
          name: createdCondo.name,
          managerEmail: createCondominiumDto.managerEmail,
          password: temporaryPassword,
        },
      });

      // Assert the final result
      expect(result).toEqual({
        condominium: createdCondo,
        managerInitialPassword: temporaryPassword,
      });
    });

    it('should throw a ConflictException if the condominium CNPJ already exists', async () => {
      // Arrange
      const existingCondo = { id: 'condo-uuid-456' } as Condominium;
      condominiumRepository.findByCnpj.mockResolvedValue(existingCondo);

      // Act & Assert
      await expect(useCase.execute(createCondominiumDto)).rejects.toThrow(
        new ConflictException('A condominium with this CNPJ already exists.'),
      );
      expect(condominiumRepository.createWithManager).not.toHaveBeenCalled();
    });

    it('should throw a ConflictException if the manager email already exists', async () => {
      // Arrange
      condominiumRepository.findByCnpj.mockResolvedValue(null);

      const conflictError = new ConflictException(
        'Este e-mail de síndico já está em uso.',
      );
      condominiumRepository.createWithManager.mockRejectedValue(conflictError);

      // Act & Assert
      await expect(useCase.execute(createCondominiumDto)).rejects.toThrow(
        conflictError,
      );
      expect(condominiumRepository.createWithManager).toHaveBeenCalledTimes(1);
    });

    it('should throw a generic Error if the transaction fails for other reasons', async () => {
      // Arrange
      condominiumRepository.findByCnpj.mockResolvedValue(null);
      const dbError = new Error('Database connection lost');
      condominiumRepository.createWithManager.mockRejectedValue(dbError);

      // Act & Assert
      // MELHORIA: A asserção agora verifica o tipo da exceção e a mensagem,
      // tornando o teste mais robusto e específico.
      await expect(useCase.execute(createCondominiumDto)).rejects.toThrow(
        new InternalServerErrorException(
          'An internal error occurred while creating the condominium.',
        ),
      );
      expect(condominiumRepository.createWithManager).toHaveBeenCalledTimes(1);
    });
  });
});
