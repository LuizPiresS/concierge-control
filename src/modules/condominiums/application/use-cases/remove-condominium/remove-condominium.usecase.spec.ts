import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Condominium } from '@prisma/client';
import {
  CONDOMINIUM_REPOSITORY_TOKEN,
  ICondominiumRepository,
} from '../../../domain/repositories/condominium.repository.interface';
import { RemoveCondominiumUseCase } from './remove-condominium.usecase';

// Mock de um condomínio para ser usado nos testes
const mockCondominium: Condominium = {
  id: 'a-valid-uuid',
  name: 'Condo to Delete',
  cnpj: '99888777000166',
  street: 'Rua da Remoção',
  number: '404',
  neighborhood: 'Bairro do Teste',
  city: 'Cidade da Simulação',
  state: 'TS',
  zipCode: '87654321',
  complement: null,
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

describe('RemoveCondominiumUseCase', () => {
  let useCase: RemoveCondominiumUseCase;
  let repository: jest.Mocked<ICondominiumRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveCondominiumUseCase,
        {
          provide: CONDOMINIUM_REPOSITORY_TOKEN,
          useValue: {
            findByUnique: jest.fn(),
            softDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<RemoveCondominiumUseCase>(RemoveCondominiumUseCase);
    repository = module.get(CONDOMINIUM_REPOSITORY_TOKEN);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should successfully soft-delete an existing condominium', async () => {
    // Arrange
    const condominiumId = 'a-valid-uuid';
    repository.findByUnique.mockResolvedValue(mockCondominium);
    // O método softDelete retorna a entidade atualizada, mas o caso de uso retorna boolean.
    repository.softDelete.mockResolvedValue({
      ...mockCondominium,
      isDeleted: true,
      isActive: false,
    });

    // Act
    const result = await useCase.execute(condominiumId);

    // Assert
    expect(result).toBe(true);
    expect(repository.findByUnique).toHaveBeenCalledWith({ id: condominiumId });
    expect(repository.softDelete).toHaveBeenCalledWith({ id: condominiumId });
    expect(repository.findByUnique).toHaveBeenCalledTimes(1);
    expect(repository.softDelete).toHaveBeenCalledTimes(1);
  });

  it('should throw a NotFoundException if the condominium does not exist', async () => {
    // Arrange
    const condominiumId = 'non-existent-uuid';
    repository.findByUnique.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(condominiumId)).rejects.toThrow(
      new NotFoundException(
        `Condomínio com ID ${condominiumId} não encontrado.`,
      ),
    );

    expect(repository.findByUnique).toHaveBeenCalledWith({ id: condominiumId });
    expect(repository.softDelete).not.toHaveBeenCalled();
  });
});
