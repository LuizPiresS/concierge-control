import {
  CondominiumInResponse,
  CreateCondominiumResponseDto,
} from './create-condominium-response.dto';

describe('CondominiumInResponse', () => {
  it('should correctly hold condominium data', () => {
    // Arrange
    const now = new Date();
    const condominiumData = {
      id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
      name: 'Residencial Jardins',
      cnpj: '12345678000190',
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Bairro Feliz',
      createdAt: now,
      updatedAt: now,
    };

    // Act
    const condominium = new CondominiumInResponse();
    Object.assign(condominium, condominiumData);

    // Assert
    expect(condominium).toBeInstanceOf(CondominiumInResponse);
    expect(condominium.id).toBe('a1b2c3d4-e5f6-7890-1234-567890abcdef');
    expect(condominium.name).toBe('Residencial Jardins');
    expect(condominium.cnpj).toBe('12345678000190');
    expect(condominium.street).toBe('Rua das Flores');
    expect(condominium.number).toBe('123');
    expect(condominium.neighborhood).toBe('Bairro Feliz');
    expect(condominium.createdAt).toBe(now);
    expect(condominium.updatedAt).toBe(now);
  });
});

describe('CreateCondominiumResponseDto', () => {
  it('should correctly hold the response data for condominium creation', () => {
    // Arrange
    const now = new Date();
    const condominium = new CondominiumInResponse();
    Object.assign(condominium, {
      id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
      name: 'Residencial Jardins',
      cnpj: '12345678000190',
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Bairro Feliz',
      createdAt: now,
      updatedAt: now,
    });
    const password = 'aB1!cDe2$fGh';

    // Act
    const responseDto = new CreateCondominiumResponseDto();
    responseDto.condominium = condominium;
    responseDto.managerInitialPassword = password;

    // Assert
    expect(responseDto).toBeInstanceOf(CreateCondominiumResponseDto);
    expect(responseDto.condominium).toBe(condominium);
    expect(responseDto.managerInitialPassword).toBe(password);
  });
});
