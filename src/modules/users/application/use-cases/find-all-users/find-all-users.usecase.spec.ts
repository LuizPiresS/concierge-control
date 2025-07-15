import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../infrastructure/repositories/user.repository';
import { User } from '@prisma/client';
import { FindAllUsersUseCase } from './find-all-users.usecase';

// Create a mock for the repository
const mockUserRepository: Partial<IUserRepository> = {
  findMany: jest.fn(),
};

describe('FindAllUsersUseCase', () => {
  let useCase: FindAllUsersUseCase;
  let repository: IUserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllUsersUseCase,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindAllUsersUseCase>(FindAllUsersUseCase);
    repository = module.get<IUserRepository>(USER_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('execute', () => {
    it('should return an array of users without the password field', async () => {
      // Arrange
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'test1@example.com',
          password: 'hashed_password_1',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          isDeleted: false,
          condominiumId: 'a-valid-uuid',
        },
        {
          id: '2',
          email: 'test2@example.com',
          password: 'hashed_password_2',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: false,
          isDeleted: true,
          condominiumId: 'a-valid-uuid',
        },
      ];
      (repository.findMany as jest.Mock).mockResolvedValue(mockUsers);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(repository.findMany).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[1]).not.toHaveProperty('password');
      expect(result[0].id).toBe(mockUsers[0].id);
      expect(result[0].email).toBe(mockUsers[0].email);
    });

    it('should return an empty array if the repository finds no users', async () => {
      // Arrange
      (repository.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(repository.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should propagate errors from the repository', async () => {
      // Arrange
      const expectedError = new Error('Database connection failed');
      (repository.findMany as jest.Mock).mockRejectedValue(expectedError);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(expectedError);
      expect(repository.findMany).toHaveBeenCalledTimes(1);
    });
  });
});
