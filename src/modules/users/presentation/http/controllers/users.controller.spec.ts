import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { UsersController } from './users.controller';
import { UserService } from '../../../application/services/users.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

// A mock user object to be returned by the service.
// Its shape now matches the actual `User` entity, but without the password.
const mockSafeUser: Omit<User, 'password'> = {
  id: 'a-valid-uuid',
  email: 'test-user@example.com',
  condominiumId: 'condo-uuid-1',
  isActive: true,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// We create a mock implementation of the UserService.
// Each method is a Jest mock function (jest.fn()).
const mockUserService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UserController', () => {
  let controller: UsersController;
  let service: UserService;

  beforeEach(async () => {
    // Reset mocks before each test to ensure a clean state
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      // Provide the mock service instead of the real one
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should create a new user and return it', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        password: 'password123',
        condominiumId: 'a-valid-uuid',
      };

      // Configure the mock service to return the mock user when 'create' is called
      mockUserService.create.mockResolvedValue(mockSafeUser);

      const result = await controller.create(createUserDto);

      // Check if the service's create method was called with the correct DTO
      expect(service.create).toHaveBeenCalledWith(createUserDto);
      // Check if the controller returned the value from the service
      expect(result).toEqual(mockSafeUser);
    });
  });

  describe('findAll()', () => {
    it('should return an array of users', async () => {
      const users = [mockSafeUser];
      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne()', () => {
    it('should return a single user by ID', async () => {
      const userId = mockSafeUser.id;
      mockUserService.findOne.mockResolvedValue(mockSafeUser);

      const result = await controller.findOne(userId);

      expect(service.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockSafeUser);
    });
  });

  describe('update()', () => {
    it('should update a user and return the updated user', async () => {
      const userId = mockSafeUser.id;
      const updateUserDto: UpdateUserDto = { email: 'updated@email.com' };
      const updatedUser = { ...mockSafeUser, ...updateUserDto };

      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove()', () => {
    it('should remove a user and return true', async () => {
      const userId = mockSafeUser.id;
      // The service's remove method returns a promise that resolves to a boolean.
      mockUserService.remove.mockResolvedValue(true);

      // The controller returns the promise from the service.
      const result = await controller.remove(userId);

      expect(service.remove).toHaveBeenCalledWith(userId);
      // Since the method is decorated with @HttpCode(HttpStatus.NO_CONTENT),
      // NestJS handles the response. The controller method itself returns the promise
      // from the service.
      expect(result).toBe(true);
    });
  });
});
