import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { USER_REPOSITORY_TOKEN } from '../../../infrastructure/repositories/user.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserMapper } from '../../mappers/user.mapper';
import { UpdateUserUseCase } from './update-user.usecase';

// Mock the bcrypt library
jest.mock('bcrypt');

describe('UpdateUserUseCase', () => {
  let updateUserUseCase: UpdateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let userMapper: jest.Mocked<UserMapper>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: {
            findByUnique: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: UserMapper,
          useValue: {
            updateDtoToUpdateInput: jest.fn(),
          },
        },
      ],
    }).compile();

    updateUserUseCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    userRepository = module.get(USER_REPOSITORY_TOKEN);
    userMapper = module.get(UserMapper);

    // Reset mocks before each test to ensure isolation
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(updateUserUseCase).toBeDefined();
  });

  describe('execute', () => {
    const userId = 'some-uuid-123';
    const mockUser: User = {
      id: userId,
      email: 'john.doe@example.com',
      password: 'hashedPassword123',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      isActive: true,
    };

    it('should throw NotFoundException if user does not exist', async () => {
      // Arrange
      const request = {
        id: userId,
        dto: { email: 'emailUpdates@email.com' },
      };
      userRepository.findByUnique.mockResolvedValue(null);

      // Act & Assert
      // CORRIGIDO: A chamada ao execute agora passa um único objeto 'request'.
      await expect(updateUserUseCase.execute(request)).rejects.toThrow(
        new NotFoundException(`Usuário com ID ${userId} não encontrado.`),
      );

      expect(userRepository.findByUnique).toHaveBeenCalledWith({ id: userId });
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should update user data without changing the password', async () => {
      // Arrange
      const request = {
        id: userId,
        dto: { email: 'emailUpdates@email.com' },
      };
      const dataToUpdate = { email: 'emailUpdates@email.com' };
      const updatedUser = { ...mockUser, email: 'emailUpdates@email.com' };

      userRepository.findByUnique.mockResolvedValue(mockUser);
      userMapper.updateDtoToUpdateInput.mockReturnValue(dataToUpdate);
      userRepository.update.mockResolvedValue(updatedUser);

      // Act
      // CORRIGIDO: A chamada ao execute agora passa um único objeto 'request'.
      const result = await updateUserUseCase.execute(request);

      // Assert
      expect(userRepository.findByUnique).toHaveBeenCalledWith({ id: userId });
      // CORRIGIDO: Verifica se o mapper foi chamado com o DTO de dentro do request.
      expect(userMapper.updateDtoToUpdateInput).toHaveBeenCalledWith(
        request.dto,
      );
      expect(userRepository.update).toHaveBeenCalledWith(
        { id: userId },
        dataToUpdate,
      );
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(result).toEqual({
        id: updatedUser.id,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        isDeleted: false,
        isActive: true,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should update user and hash the new password if provided', async () => {
      // Arrange
      const request = {
        id: userId,
        dto: { password: 'newPassword456' },
      };
      const dataToUpdate = { password: 'newPassword456' };
      const hashedPassword = 'hashedNewPassword456';
      const updatedUser = { ...mockUser, password: hashedPassword };

      userRepository.findByUnique.mockResolvedValue(mockUser);
      userMapper.updateDtoToUpdateInput.mockReturnValue(dataToUpdate);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.update.mockResolvedValue(updatedUser);

      // Act
      // CORRIGIDO: A chamada ao execute agora passa um único objeto 'request'.
      const result = await updateUserUseCase.execute(request);

      // Assert
      expect(userRepository.findByUnique).toHaveBeenCalledWith({ id: userId });
      expect(userMapper.updateDtoToUpdateInput).toHaveBeenCalledWith(
        request.dto,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword456', 10);
      expect(userRepository.update).toHaveBeenCalledWith(
        { id: userId },
        { password: hashedPassword },
      );
      expect(result).not.toHaveProperty('password');
    });

    it('should return the updated user without the password field', async () => {
      // Arrange
      const newEmail = 'jane.doe@example.com';
      const request = {
        id: userId,
        dto: { email: newEmail },
      };
      const dataToUpdate = { email: newEmail };
      const updatedUserWithPassword = { ...mockUser, email: newEmail };

      userRepository.findByUnique.mockResolvedValue(mockUser);
      userMapper.updateDtoToUpdateInput.mockReturnValue(dataToUpdate);
      userRepository.update.mockResolvedValue(updatedUserWithPassword);

      // Act
      // CORRIGIDO: A chamada ao execute agora passa um único objeto 'request'.
      const result = await updateUserUseCase.execute(request);

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        email: newEmail,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        isDeleted: false,
        isActive: true,
      });
      expect(result).not.toHaveProperty('password');
    });
  });
});
