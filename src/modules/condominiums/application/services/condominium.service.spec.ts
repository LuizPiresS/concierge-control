import { Test, TestingModule } from '@nestjs/testing';
import { Condominium } from '@prisma/client';
import {
  CreateCondominiumUseCase,
  CreateCondominiumResponse,
} from '../use-cases/create-condominium/create-condominium.usecase';
import { CreateCondominiumDto } from '../../presentation/http/dtos/create-condominium.dto';
import { CondominiumService } from './condominium.service';

// Mock para a dependência do serviço
const mockCreateCondominiumUseCase = {
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

// --- CÓDIGO CORRIGIDO ---
// Mock da entidade que seria retornada pelo caso de uso, construído de forma explícita e segura.
const mockCondominiumEntity: Condominium = {
  // 1. Campos que a entidade tem e o DTO não
  id: 'a-unique-uuid',
  isActive: true,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),

  // 2. Campos obrigatórios que são compartilhados
  name: validCreateDto.name,
  cnpj: validCreateDto.cnpj,
  street: validCreateDto.street,
  number: validCreateDto.number,
  neighborhood: validCreateDto.neighborhood,
  city: validCreateDto.city,
  state: validCreateDto.state,
  zipCode: validCreateDto.zipCode,

  // 3. Campos opcionais, tratando a conversão de `undefined` (do DTO) para `null` (da Entidade).
  //    Esta é a forma mais segura e clara de garantir a compatibilidade de tipos.
  email: validCreateDto.email ?? null,
  phone: validCreateDto.phone ?? null,
  complement: validCreateDto.complement ?? null,
  stateRegistration: validCreateDto.stateRegistration ?? null,
  municipalRegistration: validCreateDto.municipalRegistration ?? null,
  logoUrl: validCreateDto.logoUrl ?? null,
};

describe('CondominiumService', () => {
  let service: CondominiumService;
  // --- MELHORIA DE TIPAGEM ---
  let createCondominiumUseCase: jest.Mocked<CreateCondominiumUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CondominiumService,
        {
          provide: CreateCondominiumUseCase,
          useValue: mockCreateCondominiumUseCase,
        },
      ],
    }).compile();

    service = module.get<CondominiumService>(CondominiumService);
    // A instância injetada agora é corretamente tipada como um mock completo.
    createCondominiumUseCase = module.get(CreateCondominiumUseCase);

    // Limpa os mocks antes de cada teste para garantir isolamento
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should call the CreateCondominiumUseCase with the correct parameters and return its result', async () => {
      // Arrange
      const createDto = { ...validCreateDto };
      const expectedResult: CreateCondominiumResponse = {
        condominium: mockCondominiumEntity,
        managerInitialPassword: 'mock-password-123',
      };

      // Configura o mock para simular o sucesso do caso de uso
      createCondominiumUseCase.execute.mockResolvedValue(expectedResult);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(createCondominiumUseCase.execute).toHaveBeenCalledTimes(1);
      expect(createCondominiumUseCase.execute).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors from the use case', async () => {
      // Arrange
      const createDto = { ...validCreateDto };
      const expectedError = new Error('Failed to create condominium');

      // Configura o mock para simular uma falha no caso de uso
      createCondominiumUseCase.execute.mockRejectedValue(expectedError);

      // Act & Assert
      // Verifica se o serviço repassa a exceção lançada pelo caso de uso
      await expect(service.create(createDto)).rejects.toThrow(expectedError);
    });
  });
});
