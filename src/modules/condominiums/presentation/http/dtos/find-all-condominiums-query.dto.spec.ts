import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FindAllCondominiumsQueryDto } from './find-all-condominiums-query.dto';

// We can't directly import the private `toBoolean` function,
// so we'll test its behavior through the DTO's transform decorator.
// If it were exported, we would test it separately like this:
/*
  describe('toBoolean', () => {
    it('should return true for "true" string', () => expect(toBoolean('true')).toBe(true));
    it('should return false for "false" string', () => expect(toBoolean('false')).toBe(false));
    it('should be case-insensitive for "true"', () => expect(toBoolean('TRUE')).toBe(true));
    it('should return true for boolean true', () => expect(toBoolean(true)).toBe(true));
    it('should return false for other strings', () => expect(toBoolean('any-string')).toBe(false));
    it('should return true for truthy values', () => expect(toBoolean(1)).toBe(true));
    it('should return false for falsy values', () => expect(toBoolean(0)).toBe(false));
    it('should return false for null', () => expect(toBoolean(null)).toBe(false));
    it('should return false for undefined', () => expect(toBoolean(undefined)).toBe(false));
  });
*/

describe('FindAllCondominiumsQueryDto', () => {
  it('should be valid with no properties', async () => {
    // Arrange
    const dto = plainToInstance(FindAllCondominiumsQueryDto, {});

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBe(0);
    expect(dto.isActive).toBeUndefined();
    expect(dto.isDeleted).toBeUndefined();
  });

  it('should correctly transform string "true" to boolean true', async () => {
    // Arrange
    const input = { isActive: 'true', isDeleted: 'true' };
    const dto = plainToInstance(FindAllCondominiumsQueryDto, input);

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBe(0);
    expect(dto.isActive).toBe(true);
    expect(dto.isDeleted).toBe(true);
  });

  it('should correctly transform string "false" to boolean false', async () => {
    // Arrange
    const input = { isActive: 'false', isDeleted: 'false' };
    const dto = plainToInstance(FindAllCondominiumsQueryDto, input);

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBe(0);
    expect(dto.isActive).toBe(false);
    expect(dto.isDeleted).toBe(false);
  });

  it('should handle case-insensitive "TRUE" string', async () => {
    // Arrange
    const input = { isActive: 'TRUE' };
    const dto = plainToInstance(FindAllCondominiumsQueryDto, input);

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBe(0);
    expect(dto.isActive).toBe(true);
  });

  it('should handle actual boolean values correctly', async () => {
    // Arrange
    const input = { isActive: true, isDeleted: false };
    const dto = plainToInstance(FindAllCondominiumsQueryDto, input);

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBe(0);
    expect(dto.isActive).toBe(true);
    expect(dto.isDeleted).toBe(false);
  });

  it('should transform any other string to false', async () => {
    // Arrange
    // In a real HTTP request, query params are strings.
    const input = { isActive: 'any-random-string' };
    const dto = plainToInstance(FindAllCondominiumsQueryDto, input);

    // Act
    const errors = await validate(dto);

    // Assert
    // The @Transform runs first, converting the string to `false`.
    // Then @IsBoolean validates the result, which is a valid boolean.
    expect(errors.length).toBe(0);
    expect(dto.isActive).toBe(false);
  });

  it('should handle partial DTOs correctly', async () => {
    // Arrange
    const input = { isDeleted: 'true' };
    const dto = plainToInstance(FindAllCondominiumsQueryDto, input);

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBe(0);
    expect(dto.isActive).toBeUndefined();
    expect(dto.isDeleted).toBe(true);
  });

  it('should correctly handle other truthy/falsy values', async () => {
    // Arrange
    const inputWithTruthy = { isActive: 1 };
    const inputWithFalsy = { isDeleted: 0 };

    const dtoWithTruthy = plainToInstance(
      FindAllCondominiumsQueryDto,
      inputWithTruthy,
    );
    const dtoWithFalsy = plainToInstance(
      FindAllCondominiumsQueryDto,
      inputWithFalsy,
    );

    // Act
    const errorsTruthy = await validate(dtoWithTruthy);
    const errorsFalsy = await validate(dtoWithFalsy);

    // Assert
    expect(errorsTruthy.length).toBe(0);
    expect(dtoWithTruthy.isActive).toBe(true); // !!1 === true

    expect(errorsFalsy.length).toBe(0);
    expect(dtoWithFalsy.isDeleted).toBe(false); // !!0 === false
  });
});
