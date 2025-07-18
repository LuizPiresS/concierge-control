import { Test, TestingModule } from '@nestjs/testing';
import { Condominium } from '@prisma/client';
import {
  CreateCondominiumResponse,
  CreateCondominiumUseCase,
} from '../use-cases/create-condominium/create-condominium.usecase';
import { CreateCondominiumDto } from '../../presentation/http/dtos/create-condominium.dto';
import { CondominiumService } from './condominium.service';
import { UpdateCondominiumUseCase } from '../use-cases/update-condominium/update-condominium.usecase';
import { UpdateCondominiumDto } from '../../presentation/http/dtos/update-condominium.dto';
// --- 1. Importe as dependências para o teste de 'findAll' ---
import { FindAllCondominiumsUseCase } from '../use-cases/find-all-condominiums/find-all-condominiums.usecase';
import { UpdateCondominiumResponseDto } from '../../presentation/http/dtos/update-condominium-response.dto';

// Mocks para as dependências
const mockCreateCondominiumUseCase = {
  execute: jest.fn(),
};

const mockUpdateCondominiumUseCase = {
  execute: jest.fn(),
};

// --- 2. Crie um mock para o FindAllCondominiumsUseCase ---
const mockFindAllCondominiumsUseCase = {
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
  let updateCondominiumUseCase: jest.Mocked<UpdateCondominiumUseCase>;
  // --- 3. Declare uma variável para o mock de listagem ---
  let findAllCondominiumsUseCase: jest.Mocked<FindAllCondominiumsUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CondominiumService,
        {
          provide: CreateCondominiumUseCase,
          useValue: mockCreateCondominiumUseCase,
        },
        {
          provide: UpdateCondominiumUseCase,
          useValue: mockUpdateCondominiumUseCase,
        },
        // --- 4. Forneça o mock do FindAllCondominiumsUseCase ---
        {
          provide: FindAllCondominiumsUseCase,
          useValue: mockFindAllCondominiumsUseCase,
        },
      ],
    }).compile();

    service = module.get<CondominiumService>(CondominiumService);
    createCondominiumUseCase = module.get(CreateCondominiumUseCase);
    updateCondominiumUseCase = module.get(UpdateCondominiumUseCase);
    // --- 5. Obtenha a instância do mock injetado ---
    findAllCondominiumsUseCase = module.get(FindAllCondominiumsUseCase);

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
  });

  describe('update', () => {
    it('should call the UpdateCondominiumUseCase with the correct parameters and return its result', async () => {
      const condominiumId = 'a-unique-uuid';
      const updateDto: UpdateCondominiumDto = { name: 'New Condominium Name' };
      const expectedResult: Condominium = {
        ...mockCondominiumEntity,
        name: 'New Condominium Name',
        updatedAt: new Date(),
      };

      updateCondominiumUseCase.execute.mockResolvedValue(expectedResult);

      const result = await service.update(condominiumId, updateDto);

      expect(updateCondominiumUseCase.execute).toHaveBeenCalledTimes(1);
      expect(updateCondominiumUseCase.execute).toHaveBeenCalledWith({
        id: condominiumId,
        dto: updateDto,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  // --- 6. Adicione testes para o novo método 'findAll' ---
  describe('findAll', () => {
    it('should call the FindAllCondominiumsUseCase and return a list of condominiums', async () => {
      // Arrange
      const expectedResult: UpdateCondominiumResponseDto[] = [
        { ...mockCondominiumEntity },
      ];
      findAllCondominiumsUseCase.execute.mockResolvedValue(expectedResult);

      // Act
      const result = await service.findAll();

      // Assert
      expect(findAllCondominiumsUseCase.execute).toHaveBeenCalledTimes(1);
      expect(findAllCondominiumsUseCase.execute).toHaveBeenCalledWith(); // Verifica que foi chamado sem argumentos
      expect(result).toEqual(expectedResult);
    });

    it('should return an empty array if the use case finds no condominiums', async () => {
      // Arrange
      findAllCondominiumsUseCase.execute.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(findAllCondominiumsUseCase.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should propagate errors from the findAll use case', async () => {
      // Arrange
      const expectedError = new Error('Failed to list condominiums');
      findAllCondominiumsUseCase.execute.mockRejectedValue(expectedError);

      // Act & Assert
      await expect(service.findAll()).rejects.toThrow(expectedError);
    });
  });
});
