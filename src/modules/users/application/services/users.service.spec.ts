import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { CreateUserUseCase } from '../use-cases/create-user/create-user.usecase';
import { FindAllUsersUseCase } from '../use-cases/find-all-users/find-all-users.usecase';
import { FindUserByIdUseCase } from '../use-cases/find-user-by-id/find-user-by-id.usecase';
import { UpdateUserUseCase } from '../use-cases/update-user/update-user.usecase';
import { RemoveUserUseCase } from '../use-cases/remove-user/remove-user.usecase';
import { FindUserByEmailUseCase } from '../use-cases/find-user-by-email/find-user-by-id.usecase';
import { CreateUserDto } from '../../presentation/http/dtos/create-user.dto';
import { UpdateUserDto } from '../../presentation/http/dtos/update-user.dto';
import { UserService } from './users.service';

// Mock User data for testing
const mockUser: User = {
  id: 'a-uuid',
  email: 'test@example.com',
  password: 'hashedpassword',
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  isActive: true,
};

// Mock factory para os casos de uso
const createMockUseCase = () => ({
  execute: jest.fn(),
});

describe('UserService', () => {
  let service: UserService;
  let createUserUseCase: jest.Mocked<CreateUserUseCase>;
  let findAllUsersUseCase: jest.Mocked<FindAllUsersUseCase>;
  let findUserByIdUseCase: jest.Mocked<FindUserByIdUseCase>;
  let updateUserUseCase: jest.Mocked<UpdateUserUseCase>;
  let removeUserUseCase: jest.Mocked<RemoveUserUseCase>;
  let findUserByEmailUseCase: jest.Mocked<FindUserByEmailUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: CreateUserUseCase, useFactory: createMockUseCase },
        { provide: FindAllUsersUseCase, useFactory: createMockUseCase },
        { provide: FindUserByIdUseCase, useFactory: createMockUseCase },
        { provide: UpdateUserUseCase, useFactory: createMockUseCase },
        { provide: RemoveUserUseCase, useFactory: createMockUseCase },
        { provide: FindUserByEmailUseCase, useFactory: createMockUseCase },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    createUserUseCase = module.get(CreateUserUseCase);
    findAllUsersUseCase = module.get(FindAllUsersUseCase);
    findUserByIdUseCase = module.get(FindUserByIdUseCase);
    updateUserUseCase = module.get(UpdateUserUseCase);
    removeUserUseCase = module.get(RemoveUserUseCase);
    findUserByEmailUseCase = module.get(FindUserByEmailUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should delegate user creation to CreateUserUseCase', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        password: 'password123',
      };
      createUserUseCase.execute.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(createUserUseCase.execute).toHaveBeenCalledWith(createUserDto);
      expect(createUserUseCase.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should delegate finding all users to FindAllUsersUseCase', async () => {
      const users = [mockUser];
      findAllUsersUseCase.execute.mockResolvedValue(users);

      const result = await service.findAll();

      expect(findAllUsersUseCase.execute).toHaveBeenCalledWith();
      expect(findAllUsersUseCase.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should delegate finding a user by ID to FindUserByIdUseCase', async () => {
      const userId = 'a-uuid';
      findUserByIdUseCase.execute.mockResolvedValue(mockUser);

      const result = await service.findOne(userId);

      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith(userId);
      expect(findUserByIdUseCase.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should delegate user update to UpdateUserUseCase', async () => {
      const userId = 'a-uuid';
      const updateUserDto: UpdateUserDto = {
        email: 'updated.user@example.com',
      };
      const updatedUser = { ...mockUser, ...updateUserDto };
      updateUserUseCase.execute.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      // CORRIGIDO: A asserção agora verifica se o método foi chamado com um único objeto.
      expect(updateUserUseCase.execute).toHaveBeenCalledWith({
        id: userId,
        dto: updateUserDto,
      });
      expect(updateUserUseCase.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should delegate user removal to RemoveUserUseCase', async () => {
      const userId = 'a-uuid';
      // O método execute do RemoveUserUseCase retorna um booleano
      removeUserUseCase.execute.mockResolvedValue(true);

      await service.remove(userId);

      expect(removeUserUseCase.execute).toHaveBeenCalledWith(userId);
      expect(removeUserUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('findUserByEmail', () => {
    it('should delegate finding a user by email to FindUserByEmailUseCase', async () => {
      const email = 'test@example.com';
      findUserByEmailUseCase.execute.mockResolvedValue(mockUser);

      const result = await service.findUserByEmail(email);

      expect(findUserByEmailUseCase.execute).toHaveBeenCalledWith(email);
      expect(findUserByEmailUseCase.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });
  });
});
