import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, Logger } from '@nestjs/common';
import { Condominium } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  CONDOMINIUM_REPOSITORY_TOKEN,
  ICondominiumRepository,
} from '../../../domain/repositories/condominium.repository.interface';
import { PasswordGeneratorService } from '../../../../../shared/utils/password-generator.service';
import { PrismaService } from '../../../../../infrastructure/database/prisma/prisma.service';
import { CreateCondominiumDto } from '../../../presentation/http/dtos/create-condominium.dto';
import { CreateCondominiumUseCase } from './create-condominium.usecase';

// Mock bcrypt
jest.mock('bcrypt');

describe('CreateCondominiumUseCase', () => {
  let useCase: CreateCondominiumUseCase;
  let condominiumRepository: jest.Mocked<ICondominiumRepository>;
  let passwordGenerator: jest.Mocked<PasswordGeneratorService>;
  let prismaService: jest.Mocked<PrismaService>;

  const mockCondominiumRepository = {
    findByCnpj: jest.fn(),
    // Add other methods if they are used, with jest.fn()
  };

  const mockPasswordGenerator = {
    generate: jest.fn(),
  };

  const mockPrismaService = {
    $transaction: jest.fn(),
    // Mock other prisma client methods if needed
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
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    })
      .setLogger(new Logger()) // Suppress logs during tests
      .compile();

    useCase = module.get<CreateCondominiumUseCase>(CreateCondominiumUseCase);
    condominiumRepository = module.get(CONDOMINIUM_REPOSITORY_TOKEN);
    passwordGenerator = module.get(PasswordGeneratorService);
    prismaService = module.get(PrismaService);

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
      passwordGenerator.generate.mockReturnValue(temporaryPassword);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      // CORREÇÃO: Criamos um mock do cliente transacional que pode ser inspecionado.
      const mockTransactionClient = {
        user: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn(),
        },
        condominium: {
          create: jest.fn().mockResolvedValue(createdCondo),
        },
      };

      // Mock the transaction
      prismaService.$transaction.mockImplementation(async (callback) => {
        // Usamos "as any" para contornar o erro de tipagem, já que só precisamos mockar uma parte do cliente.
        return await callback(mockTransactionClient as any);
      });

      // Act
      const result = await useCase.execute(createCondominiumDto);

      // Assert
      expect(condominiumRepository.findByCnpj).toHaveBeenCalledWith(
        createCondominiumDto.cnpj,
      );
      expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
      expect(passwordGenerator.generate).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledWith(temporaryPassword, 10);

      // Assert transaction internal calls directly on the inspectable mock
      expect(mockTransactionClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: createCondominiumDto.managerEmail },
      });

      // CORREÇÃO: Verifica se todos os dados do condomínio são passados.
      const { managerEmail: _managerEmail, ...condominiumData } =
        createCondominiumDto;
      expect(mockTransactionClient.condominium.create).toHaveBeenCalledWith({
        data: condominiumData,
      });

      expect(mockTransactionClient.user.create).toHaveBeenCalledWith({
        data: {
          email: createCondominiumDto.managerEmail,
          password: hashedPassword,
          condominium: {
            connect: { id: createdCondo.id },
          },
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

      expect(condominiumRepository.findByCnpj).toHaveBeenCalledWith(
        createCondominiumDto.cnpj,
      );
      expect(prismaService.$transaction).not.toHaveBeenCalled();
    });

    it('should throw a ConflictException if the manager email already exists', async () => {
      // Arrange
      condominiumRepository.findByCnpj.mockResolvedValue(null);

      const conflictError = new ConflictException(
        'Este e-mail de síndico já está em uso.',
      );
      prismaService.$transaction.mockRejectedValue(conflictError);

      // Act & Assert
      await expect(useCase.execute(createCondominiumDto)).rejects.toThrow(
        conflictError,
      );

      expect(condominiumRepository.findByCnpj).toHaveBeenCalledWith(
        createCondominiumDto.cnpj,
      );
      expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should throw a generic Error if the transaction fails for other reasons', async () => {
      // Arrange
      condominiumRepository.findByCnpj.mockResolvedValue(null);
      const dbError = new Error('Database connection lost');
      prismaService.$transaction.mockRejectedValue(dbError);

      // Act & Assert
      await expect(useCase.execute(createCondominiumDto)).rejects.toThrow(
        new Error('Failed to create condominium and initial manager user.'),
      );

      expect(condominiumRepository.findByCnpj).toHaveBeenCalledWith(
        createCondominiumDto.cnpj,
      );
      expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});
