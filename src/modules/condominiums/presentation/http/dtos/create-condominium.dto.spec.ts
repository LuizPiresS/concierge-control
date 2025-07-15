import { validate } from 'class-validator';
import { CreateCondominiumDto } from './create-condominium.dto';

describe('CreateCondominiumDto', () => {
  // Helper function to create a valid DTO instance
  const createValidDto = (): CreateCondominiumDto => {
    const dto = new CreateCondominiumDto();
    dto.name = 'Residencial Jardins';
    dto.cnpj = '12345678000190';
    dto.managerEmail = 'sindico.valido@example.com';
    dto.street = 'Rua das Flores';
    dto.number = '123';
    dto.neighborhood = 'Bairro Feliz';
    dto.city = 'Cidade Exemplo';
    dto.state = 'SP';
    dto.zipCode = '12345678';
    return dto;
  };

  it('should pass validation with all required fields and valid data', async () => {
    const dto = createValidDto();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with all fields (required and optional) filled correctly', async () => {
    const dto = createValidDto();
    dto.complement = 'Bloco C, Apto 101';

    dto.phone = '11987654321';
    dto.email = 'contato@residencialjardins.com';
    dto.stateRegistration = '111.222.333.444';
    dto.municipalRegistration = '555666777';
    dto.logoUrl = 'https://example.com/logo.png';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('name', () => {
    it('should fail if name is not a string', async () => {
      const dto = createValidDto();
      (dto.name as any) = 12345; // Invalid type
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail if name is empty', async () => {
      const dto = createValidDto();
      dto.name = ''; // Invalid value
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('cnpj', () => {
    it('should fail if cnpj is not 14 characters long', async () => {
      const dto = createValidDto();
      dto.cnpj = '12345'; // Too short
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isLength');
    });

    it('should fail if cnpj is empty', async () => {
      const dto = createValidDto();
      dto.cnpj = ''; // Invalid value
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('managerEmail', () => {
    it('should fail if managerEmail is not a valid email', async () => {
      const dto = createValidDto();
      dto.managerEmail = 'not-a-valid-email'; // Invalid format
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('managerEmail');
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should fail if managerEmail is empty', async () => {
      const dto = createValidDto();
      dto.managerEmail = ''; // Invalid value
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('managerEmail');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail if managerEmail is not provided', async () => {
      const dto = createValidDto();
      dto.managerEmail = 'undefined'; // Missing required field
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('managerEmail');
    });
  });

  describe('state', () => {
    it('should fail if state is not 2 characters long', async () => {
      const dto = createValidDto();
      dto.state = 'SPB'; // Too long
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isLength');
    });
  });

  describe('zipCode', () => {
    it('should fail if zipCode is not 8 characters long', async () => {
      const dto = createValidDto();
      dto.zipCode = '1234567'; // Too short
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isLength');
    });
  });

  describe('email (optional)', () => {
    it('should fail if email is provided but invalid', async () => {
      const dto = createValidDto();
      dto.email = 'not-an-email'; // Invalid format
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should pass if email is not provided', async () => {
      const dto = createValidDto();
      dto.email = undefined;
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('logoUrl (optional)', () => {
    it('should fail if logoUrl is provided but is not a valid URL', async () => {
      const dto = createValidDto();
      dto.logoUrl = 'not-a-valid-url'; // Invalid format
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('should pass if logoUrl is not provided', async () => {
      const dto = createValidDto();
      dto.logoUrl = undefined;
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  // Test for multiple validation errors at once
  it('should report multiple errors for multiple invalid fields', async () => {
    const dto = new CreateCondominiumDto(); // Start with an empty DTO
    dto.name = ''; // isNotEmpty fails
    dto.cnpj = '123'; // isLength (and isNotEmpty) fails
    dto.managerEmail = 'invalid'; // isEmail fails
    dto.state = 'S'; // isLength fails
    dto.email = 'invalid-optional-email'; // isEmail (on optional field) fails

    const errors = await validate(dto);
    // Expect errors for all required fields that are missing or invalid,
    // plus any optional fields that are invalid.
    // Missing required: street, number, neighborhood, city, zipCode (5 errors)
    // Invalid required: name, cnpj, managerEmail, state (4 errors)
    // Invalid optional: email (1 error)
    // Total: 10 errors
    expect(errors.length).toBe(10);

    const errorProperties = errors.map((err) => err.property);
    expect(errorProperties).toContain('name');
    expect(errorProperties).toContain('cnpj');
    expect(errorProperties).toContain('managerEmail');
    expect(errorProperties).toContain('street');
    expect(errorProperties).toContain('number');
    expect(errorProperties).toContain('neighborhood');
    expect(errorProperties).toContain('city');
    expect(errorProperties).toContain('state');
    expect(errorProperties).toContain('zipCode');
    expect(errorProperties).toContain('email');
  });
});
