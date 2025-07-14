import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';

import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../infrastructure/repositories/user.repository';
import { RemoveUserUseCase } from './remove-user.usecase';

// Um mock de usuário consistente para os testes.
const mockUser: User = {
  id: 'a-valid-uuid',
  email: 'john.doe@example.com',
  password: 'hashed-password',
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  isActive: true,
};

describe('RemoveUserUseCase', () => {
  let useCase: RemoveUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveUserUseCase,
        {
          provide: USER_REPOSITORY_TOKEN,
          // O mock é criado aqui, garantindo que ele tenha os métodos que precisamos.
          useValue: {
            findByUnique: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<RemoveUserUseCase>(RemoveUserUseCase);
    // A instância injetada é corretamente tipada como um mock.
    userRepository = module.get(USER_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    // Limpa o histórico de chamadas dos mocks após cada teste.
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully remove a user if they exist', async () => {
      // Arrange
      const userId = 'a-valid-uuid';
      // Usamos a instância injetada para configurar o comportamento do mock.
      userRepository.findByUnique.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue(true); // `delete` geralmente retorna void

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result).toBeTruthy(); // O método retorna void em caso de sucesso.
      expect(userRepository.findByUnique).toHaveBeenCalledWith({ id: userId });
      expect(userRepository.findByUnique).toHaveBeenCalledTimes(1);
      expect(userRepository.delete).toHaveBeenCalledWith({ id: userId });
      expect(userRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw a NotFoundException if the user does not exist', async () => {
      // Arrange
      const userId = 'non-existent-uuid';
      // Simulamos que o usuário não foi encontrado.
      userRepository.findByUnique.mockResolvedValue(null);

      // Act & Assert
      // Verificamos se a exceção correta é lançada.
      await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);
      await expect(useCase.execute(userId)).rejects.toThrow(
        `Usuário com ID ${userId} não encontrado.`,
      );

      // Verificamos que o método de deleção nunca foi chamado.
      expect(userRepository.findByUnique).toHaveBeenCalledWith({ id: userId });
      expect(userRepository.delete).not.toHaveBeenCalled();
    });
  });
});
