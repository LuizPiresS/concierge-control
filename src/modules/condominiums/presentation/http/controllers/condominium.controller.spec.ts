import { Test, TestingModule } from '@nestjs/testing';
import { CondominiumController } from './condominium.controller';
import { CondominiumService } from '../../../application/services/condominium.service';
import { CondominiumMapper } from '../../../application/mappers/condominium.mapper';
import { CreateCondominiumDto } from '../dtos/create-condominium.dto';
import { UpdateCondominiumDto } from '../dtos/update-condominium.dto';
import { v4 as uuidv4 } from 'uuid';
import { UpdateCondominiumResponseDto } from '../dtos/update-condominium-response.dto';
// CORREÇÃO 1: A entidade Condominium é importada do Prisma Client.
import { Condominium } from '@prisma/client';
import { CreateCondominiumResponse } from '../../../application/use-cases/create-condominium/create-condominium.usecase';

// Mock para CondominiumService
const mockCondominiumService = {
  create: jest.fn(),
  update: jest.fn(),
};

// Mock para CondominiumMapper
const mockCondominiumMapper = {
  entityToResponseDto: jest.fn(),
};

// --- Mock de dados completos para reutilização ---

const mockCondominiumId = uuidv4();

// CORREÇÃO 2: Mock completo e válido para o CreateCondominiumDto.
const mockCreateDto: CreateCondominiumDto = {
  name: 'Solaris',
  cnpj: '12345678000190',
  managerEmail: 'manager@solaris.com',
  street: 'Rua dos Testes',
  number: '123',
  neighborhood: 'Bairro da Qualidade',
  city: 'Cidade da Simulação',
  state: 'TS',
  zipCode: '12345678',
};

// Mock completo da entidade Condominium que seria retornada pelo serviço.
const mockCondominiumEntity: Condominium = {
  id: mockCondominiumId,
  name: 'Solaris',
  cnpj: '12345678000190',
  street: 'Rua dos Testes',
  number: '123',
  complement: null,
  neighborhood: 'Bairro da Qualidade',
  city: 'Cidade da Simulação',
  state: 'TS',
  zipCode: '12345678',
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

describe('CondominiumController', () => {
  let controller: CondominiumController;
  let service: CondominiumService;
  let mapper: CondominiumMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CondominiumController],
      providers: [
        {
          provide: CondominiumService,
          useValue: mockCondominiumService,
        },
        {
          provide: CondominiumMapper,
          useValue: mockCondominiumMapper,
        },
      ],
    }).compile();

    controller = module.get<CondominiumController>(CondominiumController);
    service = module.get<CondominiumService>(CondominiumService);
    mapper = module.get<CondominiumMapper>(CondominiumMapper);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new condominium', async () => {
      // Arrange
      const createDto: CreateCondominiumDto = { ...mockCreateDto };

      const expectedResult: CreateCondominiumResponse = {
        condominium: mockCondominiumEntity,
        managerInitialPassword: 'mock-password-123',
      };

      mockCondominiumService.create.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update an existing condominium and return a response DTO', async () => {
      // Arrange
      const condominiumId = mockCondominiumId;
      const updateDto: UpdateCondominiumDto = {
        name: 'Solaris Prime',
      };

      const updatedCondominiumEntity: Condominium = {
        ...mockCondominiumEntity,
        name: 'Solaris Prime',
        updatedAt: new Date(),
      };

      // CORREÇÃO 3: O DTO de resposta agora é um objeto completo e válido.
      const responseDto: UpdateCondominiumResponseDto = {
        ...updatedCondominiumEntity,
      };

      mockCondominiumService.update.mockResolvedValue(updatedCondominiumEntity);
      mockCondominiumMapper.entityToResponseDto.mockReturnValue(responseDto);

      // Act
      const result = await controller.update(condominiumId, updateDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(condominiumId, updateDto);
      expect(service.update).toHaveBeenCalledTimes(1);

      expect(mapper.entityToResponseDto).toHaveBeenCalledWith(
        updatedCondominiumEntity,
      );
      expect(mapper.entityToResponseDto).toHaveBeenCalledTimes(1);

      expect(result).toEqual(responseDto);
    });
  });
});
