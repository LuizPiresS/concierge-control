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

// --- MELHORIA: Mocks centralizados para clareza e reutilização ---
const mockUserRepository = {
  findByUnique: jest.fn(),
  update: jest.fn(),
};

const mockUserMapper = {
  updateDtoToUpdateInput: jest.fn(),
  // CORREÇÃO: Adicionamos o mock para o método que remove a senha.
  toSafeUser: jest.fn(),
};

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
          useValue: mockUserRepository,
        },
        {
          provide: UserMapper,
          useValue: mockUserMapper,
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
      condominiumId: 'a-valid-uuid',
    };

    it('should throw NotFoundException if user does not exist', async () => {
      // Arrange
      const request = {
        id: userId,
        dto: { email: 'emailUpdates@email.com' },
      };
      userRepository.findByUnique.mockResolvedValue(null);

      // Act & Assert
      // A chamada ao execute agora passa um único objeto 'request'.
      await expect(updateUserUseCase.execute(request)).rejects.toThrow(
        new NotFoundException(`Usuário com ID ${userId} não encontrado.`),
      );

      expect(userRepository.findByUnique).toHaveBeenCalledWith({ id: userId });
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should update user data without changing the password', async () => {
      // --- Arrange ---
      const newEmail = 'jane.doe.updated@example.com';
      const request = { id: userId, dto: { email: newEmail } };

      const dataToUpdate = { email: newEmail }; // O que o mapper de DTO retorna.
      const updatedUserFromDb = { ...mockUser, email: newEmail }; // O que o repositório retorna.
      const expectedSafeUser = { ...updatedUserFromDb }; // O que o mapper `toSafeUser` retorna.
      delete (expectedSafeUser as Partial<User>).password;

      userRepository.findByUnique.mockResolvedValue(mockUser);
      userMapper.updateDtoToUpdateInput.mockReturnValue(dataToUpdate);
      userRepository.update.mockResolvedValue(updatedUserFromDb);
      userMapper.toSafeUser.mockReturnValue(expectedSafeUser);

      // --- Act ---
      const result = await updateUserUseCase.execute(request);

      // --- Assert ---
      expect(userRepository.findByUnique).toHaveBeenCalledWith({ id: userId });
      expect(userMapper.updateDtoToUpdateInput).toHaveBeenCalledWith(
        request.dto,
      );
      expect(userRepository.update).toHaveBeenCalledWith(
        { id: userId },
        dataToUpdate,
      );
      expect(userMapper.toSafeUser).toHaveBeenCalledWith(updatedUserFromDb);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(result).toEqual(expectedSafeUser);
    });

    it('should update user and hash the new password if provided', async () => {
      // --- Arrange ---
      const newPassword = 'newSecurePassword123';
      const hashedPassword = 'hashedNewPassword456';
      const request = { id: userId, dto: { password: newPassword } };

      const dataToUpdate = { password: newPassword }; // O que o mapper de DTO retorna.
      const updatedUserFromDb = {
        ...mockUser,
        password: hashedPassword,
      };
      const expectedSafeUser = { ...updatedUserFromDb };
      delete (expectedSafeUser as Partial<User>).password;

      userRepository.findByUnique.mockResolvedValue(mockUser);
      userMapper.updateDtoToUpdateInput.mockReturnValue(dataToUpdate);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword); // O bcrypt retorna a senha hasheada.
      userRepository.update.mockResolvedValue(updatedUserFromDb);
      userMapper.toSafeUser.mockReturnValue(expectedSafeUser);

      // --- Act ---
      const result = await updateUserUseCase.execute(request);

      // --- Assert ---
      expect(userRepository.findByUnique).toHaveBeenCalledWith({ id: userId });
      expect(userMapper.updateDtoToUpdateInput).toHaveBeenCalledWith(
        request.dto,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(userRepository.update).toHaveBeenCalledWith(
        { id: userId },
        { password: hashedPassword },
      );
      expect(userMapper.toSafeUser).toHaveBeenCalledWith(updatedUserFromDb);
      expect(result).toEqual(expectedSafeUser);
    });
  });
});
