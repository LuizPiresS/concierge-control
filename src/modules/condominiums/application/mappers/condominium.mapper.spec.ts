import { Test, TestingModule } from '@nestjs/testing';
import { Condominium, Prisma } from '@prisma/client';
import { CondominiumMapper } from './condominium.mapper';
import { UpdateCondominiumDto } from '../../presentation/http/dtos/update-condominium.dto';
import { UpdateCondominiumResponseDto } from '../../presentation/http/dtos/update-condominium-response.dto';

describe('CondominiumMapper', () => {
  let mapper: CondominiumMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CondominiumMapper],
    }).compile();

    mapper = module.get<CondominiumMapper>(CondominiumMapper);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('updateDtoToUpdateInput', () => {
    it('should map UpdateCondominiumDto to Prisma.CondominiumUpdateInput, excluding managerEmail', () => {
      // Arrange
      const dto: UpdateCondominiumDto = {
        name: 'New Condominium Name',
        street: 'New Street 123',
        managerEmail: 'manager@test.com', // This should be excluded
      };

      const expectedResult: Prisma.CondominiumUpdateInput = {
        name: 'New Condominium Name',
        street: 'New Street 123',
      };

      // Act
      const result = mapper.updateDtoToUpdateInput(dto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(result).not.toHaveProperty('managerEmail');
    });

    it('should return an empty object if the DTO is empty', () => {
      // Arrange
      const dto: UpdateCondominiumDto = {};

      // Act
      const result = mapper.updateDtoToUpdateInput(dto);

      // Assert
      expect(result).toEqual({});
    });

    it('should return an empty object if the DTO only contains managerEmail', () => {
      // Arrange
      const dto: UpdateCondominiumDto = { managerEmail: 'manager@test.com' };

      // Act
      const result = mapper.updateDtoToUpdateInput(dto);

      // Assert
      expect(result).toEqual({});
    });
  });

  describe('entityToResponseDto', () => {
    it('should map a Condominium entity to an UpdateCondominiumResponseDto', () => {
      // Arrange
      const entity: Condominium = {
        id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        name: 'Solaris Condominium',
        cnpj: '12345678000190',
        street: '123 Main St',
        number: '45B', // <-- Corrected property name
        complement: 'Apt 10',
        neighborhood: 'Downtown',
        city: 'Metropolis',
        state: 'NY',
        zipCode: '10001',
        phone: '555-1234',
        email: 'contact@solaris.com',
        stateRegistration: '123.456.789-0',
        municipalRegistration: '987654321',
        logoUrl: 'https://example.com/logo.png',
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedDto = new UpdateCondominiumResponseDto();
      Object.assign(expectedDto, entity);

      // Act
      const result = mapper.entityToResponseDto(entity);

      // Assert
      expect(result).toBeInstanceOf(UpdateCondominiumResponseDto);
      expect(result).toEqual(expectedDto);
    });
  });
});
