import { Test, TestingModule } from '@nestjs/testing';
import { Condominium } from '@prisma/client';
import {
  CreateCondominiumResponse,
  CreateCondominiumUseCase,
} from '../use-cases/create-condominium/create-condominium.usecase';
import { CreateCondominiumDto } from '../../presentation/http/dtos/create-condominium.dto';
import { CondominiumService } from './condominium.service';
// --- 1. Importe as dependências necessárias para o novo teste ---
import { UpdateCondominiumUseCase } from '../use-cases/update-condominium/update-condominium.usecase';
import { UpdateCondominiumDto } from '../../presentation/http/dtos/update-condominium.dto';

// Mock para a dependência de criação
const mockCreateCondominiumUseCase = {
  execute: jest.fn(),
};

// --- 2. Crie um mock para a nova dependência de atualização ---
const mockUpdateCondominiumUseCase = {
  execute: jest.fn(),
};

// Mock de DTO completo e válido para ser reutilizado nos testes
const validCreateDto: CreateCondominiumDto = {
  name: 'Residencial Jardins',
  cnpj: '12345678000190',
  managerEmail: 'sindico@jardins.com',
  street: 'Rua das Flores',
  number: '123',
  neighborhood: 'Bairro Feliz',
  city: 'Cidade Exemplo',
  state: 'SP',
  zipCode: '12345678',
  email: 'contato@jardins.com',
  phone: '11999998888',
};

// Mock da entidade que seria retornada pelos casos de uso
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

describe('CondominiumService', () => {
  let service: CondominiumService;
  let createCondominiumUseCase: jest.Mocked<CreateCondominiumUseCase>;
  // --- 3. Declare uma variável para o mock de atualização ---
  let updateCondominiumUseCase: jest.Mocked<UpdateCondominiumUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CondominiumService,
        {
          provide: CreateCondominiumUseCase,
          useValue: mockCreateCondominiumUseCase,
        },
        // --- 4. Forneça o mock do UpdateCondominiumUseCase ---
        {
          provide: UpdateCondominiumUseCase,
          useValue: mockUpdateCondominiumUseCase,
        },
      ],
    }).compile();

    service = module.get<CondominiumService>(CondominiumService);
    createCondominiumUseCase = module.get(CreateCondominiumUseCase);
    // --- 5. Obtenha a instância do mock injetado ---
    updateCondominiumUseCase = module.get(UpdateCondominiumUseCase);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should call the CreateCondominiumUseCase with the correct parameters and return its result', async () => {
      const createDto = { ...validCreateDto };
      const expectedResult: CreateCondominiumResponse = {
        condominium: mockCondominiumEntity,
        managerInitialPassword: 'mock-password-123',
      };
      createCondominiumUseCase.execute.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(createCondominiumUseCase.execute).toHaveBeenCalledTimes(1);
      expect(createCondominiumUseCase.execute).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors from the create use case', async () => {
      const createDto = { ...validCreateDto };
      const expectedError = new Error('Failed to create condominium');
      createCondominiumUseCase.execute.mockRejectedValue(expectedError);

      await expect(service.create(createDto)).rejects.toThrow(expectedError);
    });
  });

  // --- 6. Adicione testes para o novo método 'update' ---
  describe('update', () => {
    it('should call the UpdateCondominiumUseCase with the correct parameters and return its result', async () => {
      // Arrange
      const condominiumId = 'a-unique-uuid';
      const updateDto: UpdateCondominiumDto = { name: 'New Condominium Name' };
      const expectedResult: Condominium = {
        ...mockCondominiumEntity,
        name: 'New Condominium Name',
        updatedAt: new Date(), // A data de atualização seria diferente
      };

      updateCondominiumUseCase.execute.mockResolvedValue(expectedResult);

      // Act
      const result = await service.update(condominiumId, updateDto);

      // Assert
      expect(updateCondominiumUseCase.execute).toHaveBeenCalledTimes(1);
      expect(updateCondominiumUseCase.execute).toHaveBeenCalledWith({
        id: condominiumId,
        dto: updateDto,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors from the update use case', async () => {
      // Arrange
      const condominiumId = 'a-unique-uuid';
      const updateDto: UpdateCondominiumDto = { name: 'New Name' };
      const expectedError = new Error('Failed to update condominium');

      updateCondominiumUseCase.execute.mockRejectedValue(expectedError);

      // Act & Assert
      await expect(service.update(condominiumId, updateDto)).rejects.toThrow(
        expectedError,
      );
    });
  });
});
