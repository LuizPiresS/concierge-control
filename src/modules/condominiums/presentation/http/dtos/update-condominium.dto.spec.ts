import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  validate,
} from 'class-validator';
import { UpdateCondominiumDto } from './update-condominium.dto';

jest.mock('./create-condominium.dto', () => {
  // The decorators are now imported at the top of the file.

  // This mock now more accurately reflects the real CreateCondominiumDto
  class MockCreateCondominiumDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 100)
    name: string;

    @IsString()
    @IsNotEmpty()
    @Length(14, 14)
    cnpj: string;

    @IsEmail()
    @IsNotEmpty()
    managerEmail: string;

    @IsString()
    @IsNotEmpty()
    street: string;
  }

  return { CreateCondominiumDto: MockCreateCondominiumDto };
});

describe('UpdateCondominiumDto', () => {
  it('should be defined', () => {
    expect(new UpdateCondominiumDto()).toBeDefined();
  });

  it('should pass validation for an empty object (all properties are optional)', async () => {
    const dto = new UpdateCondominiumDto();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation when only a valid name is provided', async () => {
    const dto = new UpdateCondominiumDto();
    dto.name = 'New Condominium Name';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation when only a valid street is provided', async () => {
    const dto = new UpdateCondominiumDto();
    dto.street = '456 New Avenue';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation when all properties are valid', async () => {
    const dto = new UpdateCondominiumDto();
    dto.name = 'Fully Updated Condo';
    dto.street = '789 Updated Street';
    dto.cnpj = '12345678000190';
    dto.managerEmail = 'manager@test.com';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation if name is provided but is too short', async () => {
    const dto = new UpdateCondominiumDto();
    dto.name = 'A'; // Fails @Length(3, 100)
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toEqual('name');
    // The key for the @Length decorator's constraint is 'isLength'
    expect(errors[0].constraints).toHaveProperty('isLength');
  });

  it('should fail validation if street is provided but is not a string', async () => {
    const dto = new UpdateCondominiumDto();
    (dto as any).street = 12345; // Fails @IsString()
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toEqual('street');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should fail validation if cnpj is provided but has incorrect length', async () => {
    const dto = new UpdateCondominiumDto();
    dto.cnpj = '12345'; // Fails @Length(14, 14)
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toEqual('cnpj');
    expect(errors[0].constraints).toHaveProperty('isLength');
  });

  it('should ignore non-whitelisted properties', async () => {
    const dto = new UpdateCondominiumDto();
    (dto as any).unexpectedProperty = 'should be ignored';

    // The `whitelist: true` option strips properties that are not in the DTO.
    const errors = await validate(dto, { whitelist: true });

    expect(errors.length).toBe(0);
    // After validation with whitelist, the property should be gone
    expect(dto).not.toHaveProperty('unexpectedProperty');
  });
});
