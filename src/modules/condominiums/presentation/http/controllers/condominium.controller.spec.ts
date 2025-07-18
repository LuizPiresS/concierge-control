import { Test, TestingModule } from '@nestjs/testing';
import { CondominiumController } from './condominium.controller';
import { CondominiumService } from '../../../application/services/condominium.service';
import { CondominiumMapper } from '../../../application/mappers/condominium.mapper';
import { CreateCondominiumDto } from '../dtos/create-condominium.dto';
import { UpdateCondominiumDto } from '../dtos/update-condominium.dto';
import { v4 as uuidv4 } from 'uuid';
import { UpdateCondominiumResponseDto } from '../dtos/update-condominium-response.dto';
import { Condominium } from '@prisma/client';
import { CreateCondominiumResponse } from '../../../application/use-cases/create-condominium/create-condominium.usecase';
import { FindCondominiumQueryDto } from '../dtos/find-condominium-query.dto';
import { NotFoundException } from '@nestjs/common';

// Mock para CondominiumService
const mockCondominiumService = {
  create: jest.fn(),
  update: jest.fn(),
  findAll: jest.fn(),
  findOneByCriteria: jest.fn(),
  remove: jest.fn(),
};

const mockCondominiumMapper = {
  entityToResponseDto: jest.fn(),
};

const mockCondominiumId = uuidv4();

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

  describe('findAll', () => {
    it('should return an array of condominiums', async () => {
      // Arrange
      const expectedResult: UpdateCondominiumResponseDto[] = [
        { ...mockCondominiumEntity },
      ];
      mockCondominiumService.findAll.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);
    });

    it('should return an empty array when no condominiums are found', async () => {
      // Arrange
      mockCondominiumService.findAll.mockResolvedValue([]);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('findOneBy', () => {
    it('should call the service with the correct criteria and return a condominium', async () => {
      // Arrange
      const query: FindCondominiumQueryDto = { cnpj: '12345678000190' } as any;
      const expectedResult: UpdateCondominiumResponseDto = {
        ...mockCondominiumEntity,
      };
      mockCondominiumService.findOneByCriteria.mockResolvedValue(
        expectedResult,
      );

      // Act
      const result = await controller.findOneBy(query);

      // Assert
      expect(service.findOneByCriteria).toHaveBeenCalledWith(query);
      expect(service.findOneByCriteria).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should throw an exception if the service throws it', async () => {
      // Arrange
      const query: FindCondominiumQueryDto = {
        name: 'Non Existent Condo',
      } as any;
      const error = new NotFoundException('Condominium not found.');
      mockCondominiumService.findOneByCriteria.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.findOneBy(query)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findOneByCriteria).toHaveBeenCalledWith(query);
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

  describe('remove', () => {
    it('should call the service to remove a condominium and return nothing (204 No Content)', async () => {
      // Arrange
      const condominiumId = mockCondominiumId;
      mockCondominiumService.remove.mockResolvedValue(true);

      // Act
      await controller.remove(condominiumId);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(condominiumId);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });

    it('should propagate NotFoundException if the service throws it', async () => {
      // Arrange
      const condominiumId = 'non-existent-id';
      const error = new NotFoundException(
        `Condomínio com ID ${condominiumId} não encontrado.`,
      );
      mockCondominiumService.remove.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.remove(condominiumId)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.remove).toHaveBeenCalledWith(condominiumId);
    });
  });
});
