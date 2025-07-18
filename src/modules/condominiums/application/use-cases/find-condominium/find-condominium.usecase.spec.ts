import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Condominium } from '@prisma/client';
import {
  CONDOMINIUM_REPOSITORY_TOKEN,
  ICondominiumRepository,
} from '../../../domain/repositories/condominium.repository.interface';
import { CondominiumMapper } from '../../mappers/condominium.mapper';
import { FindCondominiumUseCase } from './find-condominium.usecase';
import { UpdateCondominiumResponseDto } from '../../../presentation/http/dtos/update-condominium-response.dto';

// Mocks
const mockCondominiumRepository = {
  findFirst: jest.fn(),
};
const mockCondominiumMapper = {
  entityToResponseDto: jest.fn(),
};

const mockCondominiumEntity: Condominium = {
  id: 'uuid-1',
  name: 'Condo Test',
  cnpj: '11111111000111',
  street: 'Street 1',
  number: '100',
  complement: null,
  neighborhood: 'Neighborhood 1',
  city: 'City 1',
  state: 'S1',
  zipCode: '11111111',
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

const mockCondominiumDto: UpdateCondominiumResponseDto = {
  ...mockCondominiumEntity,
};

describe('FindCondominiumUseCase', () => {
  let useCase: FindCondominiumUseCase;
  let repository: jest.Mocked<ICondominiumRepository>;
  let mapper: jest.Mocked<CondominiumMapper>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindCondominiumUseCase,
        {
          provide: CONDOMINIUM_REPOSITORY_TOKEN,
          useValue: mockCondominiumRepository,
        },
        {
          provide: CondominiumMapper,
          useValue: mockCondominiumMapper,
        },
      ],
    }).compile();

    useCase = module.get<FindCondominiumUseCase>(FindCondominiumUseCase);
    repository = module.get(CONDOMINIUM_REPOSITORY_TOKEN);
    mapper = module.get(CondominiumMapper);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should find a condominium by CNPJ and return a mapped DTO', async () => {
    // Arrange
    repository.findFirst.mockResolvedValue(mockCondominiumEntity);
    mapper.entityToResponseDto.mockReturnValue(mockCondominiumDto);

    // Act
    const result = await useCase.execute({ cnpj: '11111111000111' });

    // Assert
    expect(repository.findFirst).toHaveBeenCalledWith({
      cnpj: '11111111000111',
    });
    expect(mapper.entityToResponseDto).toHaveBeenCalledWith(
      mockCondominiumEntity,
    );
    expect(result).toEqual(mockCondominiumDto);
  });

  it('should find a condominium by name and return a mapped DTO', async () => {
    // Arrange
    repository.findFirst.mockResolvedValue(mockCondominiumEntity);
    mapper.entityToResponseDto.mockReturnValue(mockCondominiumDto);

    // Act
    const result = await useCase.execute({ name: 'Condo Test' });

    // Assert
    expect(repository.findFirst).toHaveBeenCalledWith({ name: 'Condo Test' });
    expect(mapper.entityToResponseDto).toHaveBeenCalledWith(
      mockCondominiumEntity,
    );
    expect(result).toEqual(mockCondominiumDto);
  });

  it('should find a condominium by name and status filters', async () => {
    // Arrange
    repository.findFirst.mockResolvedValue(mockCondominiumEntity);
    mapper.entityToResponseDto.mockReturnValue(mockCondominiumDto);
    const criteria = {
      name: 'Condo Test',
      isActive: true,
      isDeleted: false,
    };

    // Act
    const result = await useCase.execute(criteria);

    // Assert
    expect(repository.findFirst).toHaveBeenCalledWith(criteria);
    expect(mapper.entityToResponseDto).toHaveBeenCalledWith(
      mockCondominiumEntity,
    );
    expect(result).toEqual(mockCondominiumDto);
  });

  it('should throw NotFoundException if no condominium is found', async () => {
    // Arrange
    repository.findFirst.mockResolvedValue(null);

    // Act & Assert
    // CORRECTION: The expected error message is now updated.
    await expect(useCase.execute({ cnpj: 'not-found-cnpj' })).rejects.toThrow(
      new NotFoundException(
        'Nenhum condomínio encontrado com os critérios fornecidos: CNPJ not-found-cnpj.',
      ),
    );
  });

  it('should throw BadRequestException if no criteria are provided', async () => {
    // Act & Assert
    await expect(useCase.execute({})).rejects.toThrow(
      new BadRequestException(
        'É necessário fornecer um critério de busca (CNPJ ou nome).',
      ),
    );
    expect(repository.findFirst).not.toHaveBeenCalled();
  });
});
