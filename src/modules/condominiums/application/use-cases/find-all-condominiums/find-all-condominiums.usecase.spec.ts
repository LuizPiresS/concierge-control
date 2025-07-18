import { Test, TestingModule } from '@nestjs/testing';
import { Condominium } from '@prisma/client';
import {
  CONDOMINIUM_REPOSITORY_TOKEN,
  ICondominiumRepository,
} from '../../../domain/repositories/condominium.repository.interface';
import { CondominiumMapper } from '../../mappers/condominium.mapper';
import { UpdateCondominiumResponseDto } from '../../../presentation/http/dtos/update-condominium-response.dto';
import { FindAllCondominiumsUseCase } from './find-all-condominiums.usecase';

// Mocks para as dependências
const mockCondominiumRepository = {
  findMany: jest.fn(),
};

const mockCondominiumMapper = {
  entityListToResponseDtoList: jest.fn(),
};

// Mock de dados para simular o retorno do banco
const mockCondominiumEntities: Condominium[] = [
  {
    id: 'uuid-1',
    name: 'Condo 1',
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
  },
];

// Mock de dados para simular o retorno do mapper
const mockCondominiumDtos: UpdateCondominiumResponseDto[] = [
  { ...mockCondominiumEntities[0] },
];

describe('FindAllCondominiumsUseCase', () => {
  let useCase: FindAllCondominiumsUseCase;
  let repository: jest.Mocked<ICondominiumRepository>;
  let mapper: jest.Mocked<CondominiumMapper>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllCondominiumsUseCase,
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

    useCase = module.get<FindAllCondominiumsUseCase>(
      FindAllCondominiumsUseCase,
    );
    repository = module.get(CONDOMINIUM_REPOSITORY_TOKEN);
    mapper = module.get(CondominiumMapper);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a list of mapped condominiums', async () => {
    // Arrange
    repository.findMany.mockResolvedValue(mockCondominiumEntities);
    mapper.entityListToResponseDtoList.mockReturnValue(mockCondominiumDtos);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(repository.findMany).toHaveBeenCalledTimes(1);
    expect(mapper.entityListToResponseDtoList).toHaveBeenCalledWith(
      mockCondominiumEntities,
    );
    expect(result).toEqual(mockCondominiumDtos);
    expect(result.length).toBe(1);
  });

  it('should return an empty list if no condominiums are found', async () => {
    // Arrange
    repository.findMany.mockResolvedValue([]);
    mapper.entityListToResponseDtoList.mockReturnValue([]);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(repository.findMany).toHaveBeenCalledTimes(1);
    expect(mapper.entityListToResponseDtoList).toHaveBeenCalledWith([]);
    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });
});
