import { Test, TestingModule } from '@nestjs/testing';
import { PrismaCondominiumRepository } from './prisma-condominium.repository';
import { Condominium } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';

// A type alias for the mocked PrismaService for better type safety
type MockPrismaService = DeepMockProxy<PrismaService>;

describe('PrismaCondominiumRepository', () => {
  let repository: PrismaCondominiumRepository;
  let prismaService: MockPrismaService;

  const mockCondominium: Condominium = {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    name: 'Solaris Condominium',
    cnpj: '12345678000199',
    createdAt: new Date(),
    updatedAt: new Date(),
    number: '',
    street: '',
    complement: null,
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    phone: null,
    email: null,
    stateRegistration: null,
    municipalRegistration: null,
    logoUrl: null,
    isDeleted: false,
    isActive: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaCondominiumRepository,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    repository = module.get<PrismaCondominiumRepository>(
      PrismaCondominiumRepository,
    );
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getModel', () => {
    it('should return the prisma condominium delegate', () => {
      // getModel is protected, so we access it with a type assertion for this specific test.
      // Its correct usage is implicitly tested by other repository methods.
      const model = (repository as any).getModel();
      expect(model).toBe(prismaService.condominium);
    });
  });

  describe('findByCnpj', () => {
    it('should call findFirst on the condominium model with the correct CNPJ and return a condominium', async () => {
      const cnpj = '12345678000199';
      // The inherited `findFirst` from GenericRepository calls `this.prisma.condominium.findFirst`
      prismaService.condominium.findFirst.mockResolvedValue(mockCondominium);

      const result = await repository.findByCnpj(cnpj);

      // We verify that the underlying prisma method was called correctly by the generic implementation
      expect(prismaService.condominium.findFirst).toHaveBeenCalledWith({
        where: { cnpj },
      });
      expect(result).toEqual(mockCondominium);
    });

    it('should return null when no condominium is found with the given CNPJ', async () => {
      const cnpj = '00000000000000';
      prismaService.condominium.findFirst.mockResolvedValue(null);

      const result = await repository.findByCnpj(cnpj);

      expect(prismaService.condominium.findFirst).toHaveBeenCalledWith({
        where: { cnpj },
      });
      expect(result).toBeNull();
    });

    it('should propagate errors from the database layer', async () => {
      const cnpj = '12345678000199';
      const dbError = new Error('Database connection failed');
      prismaService.condominium.findFirst.mockRejectedValue(dbError);

      // We expect the promise to be rejected with the same error
      await expect(repository.findByCnpj(cnpj)).rejects.toThrow(dbError);
    });
  });
});
