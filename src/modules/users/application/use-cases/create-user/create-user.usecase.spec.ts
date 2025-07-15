import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../infrastructure/repositories/user.repository';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { CreateUserDto } from '../../../presentation/http/dtos/create-user.dto';
import { CreateUserUseCase } from './create-user.usecase';
import { UserMapper } from '../../mappers/user.mapper';

// Mock the bcrypt library
jest.mock('bcrypt');

// Mock para o UserMapper
const mockUserMapper = {
  toSafeUser: jest.fn(),
};

// Mock para o IUserRepository
const mockUserRepository = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let userMapper: jest.Mocked<UserMapper>;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword123',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    isActive: false,
    condominiumId: 'a-valid-uuid',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: mockUserRepository,
        },
        // CORREÇÃO: Fornecendo o mock do UserMapper, que é uma dependência do use case.
        {
          provide: UserMapper,
          useValue: mockUserMapper,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    userRepository = module.get(USER_REPOSITORY_TOKEN);
    userMapper = module.get(UserMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      condominiumId: 'a-valid-uuid',
    };

    it('should create a new user and return it without the password', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword123';
      // Objeto seguro que o mapper deve retornar
      const safeUser = { ...mockUser };
      delete (safeUser as Partial<User>).password;

      userRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(mockUser);
      userMapper.toSafeUser.mockReturnValue(safeUser);

      // Act
      const result = await useCase.execute(createUserDto);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);

      // CORREÇÃO: A asserção agora verifica se a sintaxe 'connect' do Prisma está sendo usada.
      expect(userRepository.create).toHaveBeenCalledWith({
        email: createUserDto.email,
        password: hashedPassword,
        condominium: {
          connect: {
            id: createUserDto.condominiumId,
          },
        },
      });

      // CORREÇÃO: Verifica se o mapper foi chamado para sanitizar o usuário.
      expect(userMapper.toSafeUser).toHaveBeenCalledWith(mockUser);

      // O resultado final deve ser o que o mapper retornou.
      expect(result).toEqual(safeUser);
    });

    it('should throw a ConflictException if a user with the same email already exists', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(useCase.execute(createUserDto)).rejects.toThrow(
        new ConflictException('Um usuário com este email já existe.'),
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });
});
