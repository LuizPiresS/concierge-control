import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Condominium } from '@prisma/client';
import {
  CONDOMINIUM_REPOSITORY_TOKEN,
  ICondominiumRepository,
} from '../../../domain/repositories/condominium.repository.interface';
import { CondominiumMapper } from '../../mappers/condominium.mapper';
import { UpdateCondominiumDto } from '../../../presentation/http/dtos/update-condominium.dto';
import { UpdateCondominiumUseCase } from './update-condominium.usecase';

// Este mock está correto e completo.
const mockCondominium: Condominium = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  name: 'Residencial Sol Nascente',
  cnpj: '12345678000199',
  street: 'Rua Principal',
  number: '100',
  complement: 'Torre A',
  neighborhood: 'Centro',
  city: 'Cidade Sol',
  state: 'SP',
  zipCode: '12345000',
  phone: '11999999999',
  email: 'contato@solnascente.com',
  stateRegistration: null,
  municipalRegistration: null,
  logoUrl: null,
  isActive: true,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UpdateCondominiumUseCase', () => {
  let useCase: UpdateCondominiumUseCase;
  let condominiumRepository: jest.Mocked<ICondominiumRepository>;
  let condominiumMapper: jest.Mocked<CondominiumMapper>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCondominiumUseCase,
        {
          provide: CONDOMINIUM_REPOSITORY_TOKEN,
          useValue: {
            findByUnique: jest.fn(),
            findByCnpj: jest.fn(),
            findByEmail: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: CondominiumMapper,
          useValue: {
            updateDtoToUpdateInput: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateCondominiumUseCase>(UpdateCondominiumUseCase);
    condominiumRepository = module.get(CONDOMINIUM_REPOSITORY_TOKEN);
    condominiumMapper = module.get(CondominiumMapper);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException if condominium does not exist', async () => {
    // Arrange
    const id = 'non-existent-id';
    const dto: UpdateCondominiumDto = { name: 'New Name' };
    condominiumRepository.findByUnique.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute({ id, dto })).rejects.toThrow(
      new NotFoundException(`Condomínio com ID ${id} não encontrado.`),
    );
    expect(condominiumRepository.findByUnique).toHaveBeenCalledWith({ id });
  });

  it('should throw ConflictException if CNPJ is already used by another condominium', async () => {
    // Arrange
    const id = mockCondominium.id;
    const dto: UpdateCondominiumDto = { cnpj: '98765432000100' };
    const conflictingCondominium: Condominium = {
      ...mockCondominium,
      id: 'another-id',
      // FIX: Replaced `!` with `??` for type safety. `cnpj` must be a string.
      cnpj: dto.cnpj ?? '',
    };

    condominiumRepository.findByUnique.mockResolvedValue(mockCondominium);
    condominiumRepository.findByCnpj.mockResolvedValue(conflictingCondominium);

    // Act & Assert
    await expect(useCase.execute({ id, dto })).rejects.toThrow(
      new ConflictException('Já existe um condomínio com este CNPJ.'),
    );
    expect(condominiumRepository.findByCnpj).toHaveBeenCalledWith(dto.cnpj);
  });

  it('should throw ConflictException if email is already used by another condominium', async () => {
    // Arrange
    const id = mockCondominium.id;
    const dto: UpdateCondominiumDto = { email: 'another@email.com' };
    const conflictingCondominium: Condominium = {
      ...mockCondominium,
      id: 'another-id',
      // FIX: Replaced `!` with `??` for type safety. `email` can be null.
      email: dto.email ?? null,
    };

    condominiumRepository.findByUnique.mockResolvedValue(mockCondominium);
    condominiumRepository.findByEmail.mockResolvedValue(conflictingCondominium);

    // Act & Assert
    await expect(useCase.execute({ id, dto })).rejects.toThrow(
      new ConflictException(
        'Já existe um condomínio com este e-mail de contato.',
      ),
    );
    expect(condominiumRepository.findByEmail).toHaveBeenCalledWith(dto.email);
  });

  it('should not throw a conflict exception if the CNPJ belongs to the same condominium', async () => {
    // Arrange
    const id = mockCondominium.id;
    const dto: UpdateCondominiumDto = { cnpj: mockCondominium.cnpj };

    condominiumRepository.findByUnique.mockResolvedValue(mockCondominium);
    condominiumRepository.findByCnpj.mockResolvedValue(mockCondominium); // CNPJ found belongs to the same entity
    condominiumRepository.update.mockResolvedValue(mockCondominium);
    condominiumMapper.updateDtoToUpdateInput.mockReturnValue({
      cnpj: dto.cnpj,
    });

    // Act & Assert
    await expect(useCase.execute({ id, dto })).resolves.not.toThrow();
    expect(condominiumRepository.update).toHaveBeenCalled();
  });

  it('should successfully update the condominium', async () => {
    // Arrange
    const id = mockCondominium.id;
    const dto: UpdateCondominiumDto = {
      name: 'Residencial Lua Nova',
      email: 'contato@luanova.com',
    };
    const updateData = {
      name: dto.name,
      email: dto.email,
    };
    const updatedCondominium: Condominium = {
      ...mockCondominium,
      // FIX: Replaced `!` with `??` for type safety.
      name: dto.name ?? '',
      email: dto.email ?? null,
      updatedAt: new Date(),
    };

    condominiumRepository.findByUnique.mockResolvedValue(mockCondominium);
    condominiumRepository.findByEmail.mockResolvedValue(null); // No conflict
    condominiumMapper.updateDtoToUpdateInput.mockReturnValue(updateData);
    condominiumRepository.update.mockResolvedValue(updatedCondominium);

    // Act
    const result = await useCase.execute({ id, dto });

    // Assert
    expect(condominiumRepository.findByUnique).toHaveBeenCalledWith({ id });
    expect(condominiumRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(condominiumMapper.updateDtoToUpdateInput).toHaveBeenCalledWith(dto);
    expect(condominiumRepository.update).toHaveBeenCalledWith(
      { id },
      updateData,
    );
    expect(result).toEqual(updatedCondominium);
    expect(result.name).toBe(dto.name);
    expect(result.email).toBe(dto.email);
  });
});
