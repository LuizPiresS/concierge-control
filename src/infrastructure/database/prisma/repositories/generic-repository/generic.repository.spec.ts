import { Prisma, PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { GenericRepository } from './generic.repository'; // Adjust the import path

// Define a type for our test entity based on your schema.prisma
// This also satisfies the IBaseEntity constraint.
type User = {
  id: string;
  email: string;
  password: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Define the specific Prisma types for the User model
type UserWhereUniqueInput = Prisma.UserWhereUniqueInput;
type UserWhereInput = Prisma.UserWhereInput;
type UserCreateInput = Prisma.UserCreateInput;
type UserUpdateInput = Prisma.UserUpdateInput;

// Create a concrete implementation of the abstract repository for testing
class TestUserRepository extends GenericRepository<
  User,
  UserWhereUniqueInput,
  UserWhereInput,
  UserCreateInput,
  UserUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  protected getModel() {
    return this.prisma.user;
  }
}

describe('GenericRepository', () => {
  let repository: TestUserRepository;
  let prismaMock: DeepMockProxy<PrismaClient>;

  const mockUser: User = {
    id: 'user-uuid-123',
    email: 'test@example.com',
    password: 'hashedpassword',
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Create a deep mock of PrismaClient before each test
    prismaMock = mockDeep<PrismaClient>();
    repository = new TestUserRepository(prismaMock);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should call prisma.create with correct data and return the created entity', async () => {
      const createInput: UserCreateInput = {
        email: 'test@example.com',
        password: 'password123',
      };

      prismaMock.user.create.mockResolvedValue(mockUser as any);

      const result = await repository.create(createInput);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: createInput,
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByUnique', () => {
    it('should call prisma.findUnique and return an entity if found', async () => {
      const where: UserWhereUniqueInput = { id: mockUser.id };

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

      const result = await repository.findByUnique(where);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where });
      expect(result).toEqual(mockUser);
    });

    it('should return null if entity is not found', async () => {
      const where: UserWhereUniqueInput = { id: 'non-existent-id' };
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByUnique(where);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should call prisma.update with correct data and return the updated entity', async () => {
      const where: UserWhereUniqueInput = { id: mockUser.id };
      const data: UserUpdateInput = { email: 'updated@example.com' };
      const updatedUser = { ...mockUser, ...data };

      prismaMock.user.update.mockResolvedValue(updatedUser as any);

      const result = await repository.update(where, data);

      expect(prismaMock.user.update).toHaveBeenCalledWith({ where, data });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('delete', () => {
    it('should call prisma.delete and return true on success', async () => {
      const where: UserWhereUniqueInput = { id: mockUser.id };

      prismaMock.user.delete.mockResolvedValue(mockUser as any);

      const result = await repository.delete(where);

      expect(prismaMock.user.delete).toHaveBeenCalledWith({ where });
      expect(result).toBe(true);
    });

    it('should return false if prisma throws a P2025 error (record not found)', async () => {
      const where: UserWhereUniqueInput = { id: 'non-existent-id' };
      const p2025Error = new Prisma.PrismaClientKnownRequestError(
        'Record to delete does not exist.',
        { code: 'P2025', clientVersion: 'x.y.z' },
      );
      prismaMock.user.delete.mockRejectedValue(p2025Error);

      const result = await repository.delete(where);

      expect(result).toBe(false);
    });

    it('should re-throw other errors', async () => {
      const where: UserWhereUniqueInput = { id: mockUser.id };
      const otherError = new Error('Some other database error');
      prismaMock.user.delete.mockRejectedValue(otherError);

      await expect(repository.delete(where)).rejects.toThrow(otherError);
    });
  });

  describe('softDelete', () => {
    it('should call prisma.update with isDeleted: true and isActive: false', async () => {
      const where: UserWhereUniqueInput = { id: mockUser.id };
      const softDeletedUser = {
        ...mockUser,
        isDeleted: true,
        isActive: false,
      };

      prismaMock.user.update.mockResolvedValue(softDeletedUser as any);

      const result = await repository.softDelete(where);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where,
        data: { isDeleted: true, isActive: false },
      });
      expect(result).toEqual(softDeletedUser);
    });
  });

  describe('findFirst', () => {
    it('should call prisma.findFirst and return an entity', async () => {
      const where: UserWhereInput = { email: mockUser.email };

      prismaMock.user.findFirst.mockResolvedValue(mockUser as any);

      const result = await repository.findFirst(where);

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({ where });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findMany', () => {
    it('should call prisma.findMany and return an array of entities', async () => {
      const options = { where: { isActive: true } };

      prismaMock.user.findMany.mockResolvedValue([mockUser] as any);

      const result = await repository.findMany(options);

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(options);
      expect(result).toEqual([mockUser]);
    });
  });

  describe('count', () => {
    it('should call prisma.count and return the number of entities', async () => {
      const where: UserWhereInput = { isActive: true };
      prismaMock.user.count.mockResolvedValue(5);

      const result = await repository.count(where);

      expect(prismaMock.user.count).toHaveBeenCalledWith({ where });
      expect(result).toBe(5);
    });
  });

  describe('exists', () => {
    it('should return true if count is greater than 0', async () => {
      const where: UserWhereInput = { id: mockUser.id };
      prismaMock.user.count.mockResolvedValue(1);

      const result = await repository.exists(where);

      expect(prismaMock.user.count).toHaveBeenCalledWith({ where });
      expect(result).toBe(true);
    });

    it('should return false if count is 0', async () => {
      const where: UserWhereInput = { id: 'non-existent-id' };
      prismaMock.user.count.mockResolvedValue(0);

      const result = await repository.exists(where);

      expect(result).toBe(false);
    });
  });

  describe('findManyWithPagination', () => {
    it('should call prisma.$transaction with findMany and count', async () => {
      const page = 2;
      const limit = 5;
      const where: UserWhereInput = { isActive: true };
      const orderBy = { createdAt: 'desc' as const };
      const total = 12;
      const skip = (page - 1) * limit;

      prismaMock.$transaction.mockResolvedValue([[mockUser], total] as any);

      const result = await repository.findManyWithPagination(
        page,
        limit,
        where,
        orderBy,
      );

      expect(prismaMock.$transaction).toHaveBeenCalledWith([
        prismaMock.user.findMany({
          where,
          skip,
          take: limit,
          orderBy,
        }),
        prismaMock.user.count({ where }),
      ]);

      expect(result).toEqual({
        data: [mockUser],
        total,
        page,
        limit,
      });
    });
  });
});
