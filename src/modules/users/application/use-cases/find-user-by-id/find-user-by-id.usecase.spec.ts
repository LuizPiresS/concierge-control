import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';

import { IUserRepository } from '../../../infrastructure/repositories/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../infrastructure/repositories/user.repository';
import { FindUserByIdUseCase } from './find-user-by-id.usecase';

// A mock implementation for the IUserRepository
const mockUserRepository: Partial<IUserRepository> = {
  findByUnique: jest.fn(),
};

describe('FindUserByIdUseCase', () => {
  let useCase: FindUserByIdUseCase;
  let repository: IUserRepository;

  beforeEach(async () => {
    // Reset mocks before each test to ensure a clean state
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindUserByIdUseCase,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindUserByIdUseCase>(FindUserByIdUseCase);
    repository = module.get<IUserRepository>(USER_REPOSITORY_TOKEN);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should find a user by id and return it without the password', async () => {
      // Arrange
      const userId = 'a-valid-uuid';
      const mockUser: User = {
        id: userId,
        email: 'test@example.com',
        password: 'a-very-secret-password-hash',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        isActive: false,
      };

      // Mock the repository to return the user
      jest.spyOn(repository, 'findByUnique').mockResolvedValue(mockUser);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(repository.findByUnique).toHaveBeenCalledWith({ id: userId });
      expect(repository.findByUnique).toHaveBeenCalledTimes(1);

      const { password: _password, ...expectedResult } = mockUser;
      expect(result).toEqual(expectedResult);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException if the user does not exist', async () => {
      // Arrange
      const nonExistentUserId = 'non-existent-uuid';
      jest.spyOn(repository, 'findByUnique').mockResolvedValue(null);

      // Act
      const executePromise = useCase.execute(nonExistentUserId);

      // Assert
      await expect(executePromise).rejects.toThrow(NotFoundException);
      await expect(executePromise).rejects.toThrow(
        `Usuário com ID ${nonExistentUserId} não encontrado.`,
      );

      expect(repository.findByUnique).toHaveBeenCalledWith({
        id: nonExistentUserId,
      });
      expect(repository.findByUnique).toHaveBeenCalledTimes(1);
    });
  });
});
