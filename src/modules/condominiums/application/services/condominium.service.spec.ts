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
import { FindAllCondominiumsUseCase } from '../use-cases/find-all-condominiums/find-all-condominiums.usecase';
import { UpdateCondominiumResponseDto } from '../../presentation/http/dtos/update-condominium-response.dto';
import { FindCondominiumUseCase } from '../use-cases/find-condominium/find-condominium.usecase';
import { NotFoundException } from '@nestjs/common';
import { RemoveCondominiumUseCase } from '../use-cases/remove-condominium/remove-condominium.usecase';
// --- 1. Import the DTOs needed for testing ---
import { FindAllCondominiumsQueryDto } from '../../presentation/http/dtos/find-all-condominiums-query.dto';
import { FindCondominiumQueryDto } from '../../presentation/http/dtos/find-condominium-query.dto';

// Mocks para as dependências
const mockCreateCondominiumUseCase = {
  execute: jest.fn(),
};

const mockUpdateCondominiumUseCase = {
  execute: jest.fn(),
};

const mockFindAllCondominiumsUseCase = {
  execute: jest.fn(),
};

const mockFindCondominiumUseCase = {
  execute: jest.fn(),
};

const mockRemoveCondominiumUseCase = {
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
  let findAllCondominiumsUseCase: jest.Mocked<FindAllCondominiumsUseCase>;
  let findCondominiumUseCase: jest.Mocked<FindCondominiumUseCase>;
  let removeCondominiumUseCase: jest.Mocked<RemoveCondominiumUseCase>;

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
        {
          provide: FindAllCondominiumsUseCase,
          useValue: mockFindAllCondominiumsUseCase,
        },
        {
          provide: FindCondominiumUseCase,
          useValue: mockFindCondominiumUseCase,
        },
        {
          provide: RemoveCondominiumUseCase,
          useValue: mockRemoveCondominiumUseCase,
        },
      ],
    }).compile();

    service = module.get<CondominiumService>(CondominiumService);
    createCondominiumUseCase = module.get(CreateCondominiumUseCase);
    updateCondominiumUseCase = module.get(UpdateCondominiumUseCase);
    findAllCondominiumsUseCase = module.get(FindAllCondominiumsUseCase);
    findCondominiumUseCase = module.get(FindCondominiumUseCase);
    removeCondominiumUseCase = module.get(RemoveCondominiumUseCase);

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

  // --- 2. Updated test block for `findAll` ---
  describe('findAll', () => {
    it('should call the FindAllCondominiumsUseCase with the provided query', async () => {
      const query: FindAllCondominiumsQueryDto = { isActive: true };
      const expectedResult: UpdateCondominiumResponseDto[] = [
        { ...mockCondominiumEntity },
      ];
      findAllCondominiumsUseCase.execute.mockResolvedValue(expectedResult);

      const result = await service.findAll(query);

      expect(findAllCondominiumsUseCase.execute).toHaveBeenCalledTimes(1);
      expect(findAllCondominiumsUseCase.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });

    it('should call the use case with an empty query if no filters are provided', async () => {
      const query: FindAllCondominiumsQueryDto = {};
      findAllCondominiumsUseCase.execute.mockResolvedValue([]);

      const result = await service.findAll(query);

      expect(findAllCondominiumsUseCase.execute).toHaveBeenCalledTimes(1);
      expect(findAllCondominiumsUseCase.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual([]);
    });
  });

  // --- 3. Updated test block for `findOneByCriteria` ---
  describe('findOneByCriteria', () => {
    it('should call the FindCondominiumUseCase and return a single condominium', async () => {
      const criteria = {
        cnpj: '12345678000190',
      } as FindCondominiumQueryDto; // Cast to satisfy TypeScript
      const expectedResult: UpdateCondominiumResponseDto = {
        ...mockCondominiumEntity,
      };
      findCondominiumUseCase.execute.mockResolvedValue(expectedResult);

      const result = await service.findOneByCriteria(criteria);

      expect(findCondominiumUseCase.execute).toHaveBeenCalledTimes(1);
      expect(findCondominiumUseCase.execute).toHaveBeenCalledWith(criteria);
      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors from the findOneByCriteria use case', async () => {
      const criteria = { name: 'Non Existent' } as FindCondominiumQueryDto; // Cast to satisfy TypeScript
      const expectedError = new NotFoundException('Condominium not found');
      findCondominiumUseCase.execute.mockRejectedValue(expectedError);

      await expect(service.findOneByCriteria(criteria)).rejects.toThrow(
        expectedError,
      );
    });
  });

  describe('remove', () => {
    it('should call the RemoveCondominiumUseCase with the correct id', async () => {
      const condominiumId = 'a-valid-uuid';
      removeCondominiumUseCase.execute.mockResolvedValue(true);

      await service.remove(condominiumId);

      expect(removeCondominiumUseCase.execute).toHaveBeenCalledWith(
        condominiumId,
      );
      expect(removeCondominiumUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should return true on successful removal', async () => {
      const condominiumId = 'a-valid-uuid';
      removeCondominiumUseCase.execute.mockResolvedValue(true);

      const result = await service.remove(condominiumId);

      expect(result).toBe(true);
    });

    it('should propagate exceptions from the use case', async () => {
      const condominiumId = 'not-found-id';
      const error = new NotFoundException('Condominium not found');
      removeCondominiumUseCase.execute.mockRejectedValue(error);

      await expect(service.remove(condominiumId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
