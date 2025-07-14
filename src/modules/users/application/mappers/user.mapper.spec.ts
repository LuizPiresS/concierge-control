import { Test, TestingModule } from '@nestjs/testing';
import { UserMapper } from './user.mapper';
import { UpdateUserDto } from '../../presentation/http/dtos/update-user.dto';
import { Prisma } from '@prisma/client';

// In a real project, you would import the actual DTO.
// For this self-contained test example, we can define a mock interface
// to represent the structure of UpdateUserDto.
interface MockUpdateUserDto {
  email?: string;
  password?: string;
}

describe('UserMapper', () => {
  let mapper: UserMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserMapper],
    }).compile();

    mapper = module.get<UserMapper>(UserMapper);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('updateDtoToUpdateInput', () => {
    it('should map all provided fields from DTO to Prisma Update Input', () => {
      const dto: MockUpdateUserDto = {
        email: 'test@example.com',
        password: 'newPassword123',
      };

      const expectedResult: Prisma.UserUpdateInput = {
        email: 'test@example.com',
        password: 'newPassword123',
      };

      const result = mapper.updateDtoToUpdateInput(dto as UpdateUserDto);

      expect(result).toEqual(expectedResult);
    });

    it('should only map the email field if it is the only one provided', () => {
      const dto: MockUpdateUserDto = {
        email: 'only-email@example.com',
      };

      const expectedResult: Prisma.UserUpdateInput = {
        email: 'only-email@example.com',
      };

      const result = mapper.updateDtoToUpdateInput(dto as UpdateUserDto);

      expect(result).toEqual(expectedResult);
      expect(result.password).toBeUndefined();
    });

    it('should only map the password field if it is the only one provided', () => {
      const dto: MockUpdateUserDto = {
        password: 'only-password-456',
      };

      const expectedResult: Prisma.UserUpdateInput = {
        password: 'only-password-456',
      };

      const result = mapper.updateDtoToUpdateInput(dto as UpdateUserDto);

      expect(result).toEqual(expectedResult);
      expect(result.email).toBeUndefined();
    });

    it('should return an empty object if the DTO is empty', () => {
      const dto: MockUpdateUserDto = {};
      const expectedResult: Prisma.UserUpdateInput = {};

      const result = mapper.updateDtoToUpdateInput(dto as UpdateUserDto);

      expect(result).toEqual(expectedResult);
    });

    it('should return an empty object if all DTO fields are undefined', () => {
      const dto: MockUpdateUserDto = {
        email: undefined,
        password: undefined,
      };
      const expectedResult: Prisma.UserUpdateInput = {};

      const result = mapper.updateDtoToUpdateInput(dto as UpdateUserDto);

      expect(result).toEqual(expectedResult);
    });

    it('should ignore extra properties in the DTO object', () => {
      const dtoWithExtraProps = {
        email: 'test@example.com',
        password: 'newPassword123',
        // These fields should be ignored by the mapper
        extraField: 'should be ignored',
        role: 'admin',
      };

      const expectedResult: Prisma.UserUpdateInput = {
        email: 'test@example.com',
        password: 'newPassword123',
      };

      const result = mapper.updateDtoToUpdateInput(
        dtoWithExtraProps as UpdateUserDto,
      );

      expect(result).toEqual(expectedResult);
      // Explicitly check that extra properties are not present
      expect(result).not.toHaveProperty('extraField');
      expect(result).not.toHaveProperty('role');
    });
  });
});
