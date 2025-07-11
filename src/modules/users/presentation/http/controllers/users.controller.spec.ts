import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './users.controller';
import { UserService } from '../../../application/services/users.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { v4 as uuidv4 } from 'uuid';

// A mock user object to be returned by the service
const mockUser = {
  id: uuidv4(),
  name: 'Test User',
  email: 'test@example.com',
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
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    // Reset mocks before each test to ensure a clean state
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      // Provide the mock service instead of the real one
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
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
      };

      // Configure the mock service to return the mock user when 'create' is called
      mockUserService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      // Check if the service's create method was called with the correct DTO
      expect(service.create).toHaveBeenCalledWith(createUserDto);
      // Check if the controller returned the value from the service
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll()', () => {
    it('should return an array of users', async () => {
      const users = [mockUser];
      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne()', () => {
    it('should return a single user by ID', async () => {
      const userId = mockUser.id;
      mockUserService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(userId);

      expect(service.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update()', () => {
    it('should update a user and return the updated user', async () => {
      const userId = mockUser.id;
      const updateUserDto: UpdateUserDto = { email: 'Updated@email.com' };
      const updatedUser = { ...mockUser, ...updateUserDto };

      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove()', () => {
    it('should remove a user and return void', async () => {
      const userId = mockUser.id;
      // The remove method in the service might not return anything (void)
      mockUserService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(userId);

      expect(service.remove).toHaveBeenCalledWith(userId);
      // Since the method is decorated with @HttpCode(HttpStatus.NO_CONTENT),
      // NestJS handles the response. The controller method itself returns the promise
      // from the service, which resolves to undefined in this case.
      expect(result).toBeUndefined();
    });
  });
});
