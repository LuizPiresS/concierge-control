import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { IUserRepository } from '../../infrastructure/repositories/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../infrastructure/repositories/user.repository';
import { CreateUserDto } from '../../presentation/http/dtos/create-user.dto';
import { UpdateUserDto } from '../../presentation/http/dtos/update-user.dto';
import { UserService } from './users.service';

// Mock the entire bcrypt library
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let userRepository: IUserRepository;

  // Define a consistent mock user for our tests
  const mockUserId = 'a-valid-uuid';
  const mockUser: User = {
    id: mockUserId,
    email: 'test@example.com',
    password: 'hashedPassword123',
    isDeleted: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Create a mock repository object with Jest mock functions
  const mockUserRepository = {
    create: jest.fn(),
    findMany: jest.fn(),
    findByUnique: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    // Reset all mocks before each test to ensure test isolation
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<IUserRepository>(USER_REPOSITORY_TOKEN);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'newuser@example.com',
      password: 'password123',
    };

    it('should create a new user, hash the password, and return the user without the password', async () => {
      const hashedPassword = 'hashedNewPassword';
      const newUser = Object.assign({}, mockUser, {
        ...createUserDto,
        password: hashedPassword,
      });

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (userRepository.create as jest.Mock).mockResolvedValue(newUser);

      const result = await service.create(createUserDto);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: createUserDto.email,
        password: hashedPassword,
      });
      expect(result).not.toHaveProperty('password');
      expect(result.email).toEqual(createUserDto.email);
    });

    it('should throw a ConflictException if the email already exists', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException('Um usuário com este email já existe.'),
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of users without their passwords', async () => {
      const users = [
        mockUser,
        Object.assign({}, mockUser, {
          id: 'user-2',
          email: 'test2@example.com',
        }),
      ];
      (userRepository.findMany as jest.Mock).mockResolvedValue(users);

      const result = await service.findAll();

      expect(userRepository.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[1]).not.toHaveProperty('password');
      expect(result[0].email).toBe(mockUser.email);
    });

    it('should return an empty array if no users are found', async () => {
      (userRepository.findMany as jest.Mock).mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
      expect(userRepository.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user without the password', async () => {
      (userRepository.findByUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findOne(mockUserId);

      expect(userRepository.findByUnique).toHaveBeenCalledWith({
        id: mockUserId,
      });
      expect(result).not.toHaveProperty('password');
      expect(result.id).toEqual(mockUserId);
    });

    it('should throw a NotFoundException if user is not found', async () => {
      (userRepository.findByUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(mockUserId)).rejects.toThrow(
        new NotFoundException(`Usuário com ID ${mockUserId} não encontrado.`),
      );
      expect(userRepository.findByUnique).toHaveBeenCalledWith({
        id: mockUserId,
      });
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = { email: 'updated@example.com' };

    it('should update a user and return the updated data without the password', async () => {
      const updatedUser = Object.assign({}, mockUser, updateUserDto);
      (userRepository.findByUnique as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.update(mockUserId, updateUserDto);

      expect(userRepository.findByUnique).toHaveBeenCalledWith({
        id: mockUserId,
      });
      expect(userRepository.update).toHaveBeenCalledWith(
        { id: mockUserId },
        updateUserDto,
      );
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
      expect(result.email).toEqual(updateUserDto.email);
    });

    it('should throw a NotFoundException if user to update is not found', async () => {
      (userRepository.findByUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update(mockUserId, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      (userRepository.findByUnique as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.delete as jest.Mock).mockResolvedValue(undefined);

      await expect(service.remove(mockUserId)).resolves.toBeUndefined();

      expect(userRepository.findByUnique).toHaveBeenCalledWith({
        id: mockUserId,
      });
      expect(userRepository.delete).toHaveBeenCalledWith({ id: mockUserId });
    });

    it('should throw a NotFoundException if user to remove is not found', async () => {
      (userRepository.findByUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.remove(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('findUserByEmail', () => {
    it('should return a full user object, including password, for internal use', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findUserByEmail(mockUser.email);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(result).toEqual(mockUser);
      expect(result).toHaveProperty('password');
    });

    it('should throw a NotFoundException if user is not found by email', async () => {
      const email = 'nonexistent@example.com';
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(service.findUserByEmail(email)).rejects.toThrow(
        new NotFoundException(`Usuário com email ${email} não encontrado.`),
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
    });
  });
});
