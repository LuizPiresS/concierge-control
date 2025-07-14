import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';

import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../infrastructure/repositories/user.repository';
import { FindUserByEmailUseCase } from './find-user-by-id.usecase';

// Create a mock implementation of the IUserRepository
const mockUserRepository = {
  findByEmail: jest.fn(),
};

describe('FindUserByEmailUseCase', () => {
  let useCase: FindUserByEmailUseCase;
  let repository: IUserRepository;

  beforeEach(async () => {
    // Reset mocks before each test to ensure test isolation
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindUserByEmailUseCase,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindUserByEmailUseCase>(FindUserByEmailUseCase);
    repository = module.get<IUserRepository>(USER_REPOSITORY_TOKEN);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should find and return a user when a valid email is provided', async () => {
      // Arrange: Set up the test data and mock behavior
      const email = 'test@example.com';
      const mockUser: User = {
        id: 'user-id-123',
        email: 'test@example.com',
        password: 'hashedpassword', // The use case returns the full object
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        isActive: false,
      };

      // Configure the mock repository to return the mock user
      jest.spyOn(repository, 'findByEmail').mockResolvedValue(mockUser);

      // Act: Call the method being tested
      const result = await useCase.execute(email);

      // Assert: Check if the results are as expected
      expect(result).toEqual(mockUser);
      expect(repository.findByEmail).toHaveBeenCalledWith(email);
      expect(repository.findByEmail).toHaveBeenCalledTimes(1);
    });

    it('should throw a NotFoundException when the user is not found', async () => {
      // Arrange: Set up the test data and mock behavior
      const email = 'nonexistent@example.com';

      // Configure the mock repository to return null, simulating a user not found
      jest.spyOn(repository, 'findByEmail').mockResolvedValue(null);

      // Act & Assert: Check if the correct exception is thrown
      await expect(useCase.execute(email)).rejects.toThrow(NotFoundException);
      await expect(useCase.execute(email)).rejects.toThrow(
        `Usuário com email ${email} não encontrado.`,
      );
      expect(repository.findByEmail).toHaveBeenCalledWith(email);
    });
  });
});
