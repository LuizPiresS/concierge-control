import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { Condominium } from '@prisma/client';
import {
  CONDOMINIUM_REPOSITORY_TOKEN,
  ICondominiumRepository,
} from '../../../domain/repositories/condominium.repository.interface';
import { CreateCondominiumDto } from '../../../presentation/http/dtos/create-condominium.dto';
import { CreateCondominiumUseCase } from './create-condominium.usecase';

// A mock implementation of the ICondominiumRepository for testing purposes.
// Using Partial is fine here as we only provide the methods we need for the test.
const mockCondominiumRepository: Partial<ICondominiumRepository> = {
  create: jest.fn(),
  findByCnpj: jest.fn(),
};

describe('CreateCondominiumUseCase', () => {
  let useCase: CreateCondominiumUseCase;
  // For better type safety and autocompletion, we type the repository as a mocked version of the interface.
  let repository: jest.Mocked<ICondominiumRepository>;

  beforeEach(async () => {
    // Reset mocks before each test to ensure isolation
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCondominiumUseCase,
        {
          provide: CONDOMINIUM_REPOSITORY_TOKEN,
          useValue: mockCondominiumRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateCondominiumUseCase>(CreateCondominiumUseCase);
    // The retrieved instance is now correctly typed as a full mock.
    repository = module.get(CONDOMINIUM_REPOSITORY_TOKEN);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    // Mock de DTO completo e válido para ser reutilizado nos testes
    const validCreateDto: CreateCondominiumDto = {
      name: 'Residencial Jardins',
      cnpj: '12345678000190',
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Bairro Feliz',
      city: 'Cidade Exemplo',
      state: 'SP',
      zipCode: '12345678',
      email: 'contato@jardins.com',
      phone: '11999998888',
    };

    // Mock da entidade que seria retornada pelo caso de uso, construído de forma explícita e segura.
    const mockCondominiumEntity: Condominium = {
      id: 'a-unique-uuid',
      isActive: true,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: validCreateDto.name,
      cnpj: validCreateDto.cnpj,
      street: validCreateDto.street,
      number: validCreateDto.number,
      neighborhood: validCreateDto.neighborhood,
      city: validCreateDto.city,
      state: validCreateDto.state,
      zipCode: validCreateDto.zipCode,
      email: validCreateDto.email ?? null,
      phone: validCreateDto.phone ?? null,
      complement: validCreateDto.complement ?? null,
      stateRegistration: validCreateDto.stateRegistration ?? null,
      municipalRegistration: validCreateDto.municipalRegistration ?? null,
      logoUrl: validCreateDto.logoUrl ?? null,
    };

    it('should create a new condominium successfully', async () => {
      // Arrange: Simulate that no condominium with this CNPJ exists
      repository.findByCnpj.mockResolvedValue(null);
      // CORRIGIDO: Usar a variável mockCondominiumEntity definida
      repository.create.mockResolvedValue(mockCondominiumEntity);

      // Act: Execute the use case
      // CORRIGIDO: Usar a variável validCreateDto definida
      const result = await useCase.execute(validCreateDto);

      // Assert: Verify the correct methods were called and the result is as expected
      expect(repository.findByCnpj).toHaveBeenCalledWith(validCreateDto.cnpj);
      expect(repository.create).toHaveBeenCalledWith(validCreateDto);
      // CORRIGIDO: Usar a variável mockCondominiumEntity definida
      expect(result).toEqual(mockCondominiumEntity);
    });

    it('should throw a ConflictException if a condominium with the same CNPJ already exists', async () => {
      // Arrange: Simulate that a condominium with this CNPJ already exists
      // CORRIGIDO: Usar a variável mockCondominiumEntity definida
      repository.findByCnpj.mockResolvedValue(mockCondominiumEntity);

      // Act & Assert: Expect the use case to reject with a ConflictException
      // CORRIGIDO: Usar a variável validCreateDto definida
      await expect(useCase.execute(validCreateDto)).rejects.toThrow(
        new ConflictException('A condominium with this CNPJ already exists.'),
      );

      // Assert: Verify that findByCnpj was called but create was not
      expect(repository.findByCnpj).toHaveBeenCalledWith(validCreateDto.cnpj);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });
});
