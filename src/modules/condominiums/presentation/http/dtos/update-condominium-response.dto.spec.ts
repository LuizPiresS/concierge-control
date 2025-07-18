import { UpdateCondominiumResponseDto } from './update-condominium-response.dto';

// A constante mockCondominiumEntity foi removida, pois não era utilizada nos testes.

describe('UpdateCondominiumResponseDto', () => {
  /**
   * A basic sanity check to ensure the DTO class can be instantiated.
   */
  it('should be defined', () => {
    expect(new UpdateCondominiumResponseDto()).toBeDefined();
  });

  /**
   * This test verifies that an instance of the DTO can be created and that its
   * properties can be assigned values manually. This is the primary behavior
   * for a simple DTO class.
   */
  it('should correctly assign properties when created manually', () => {
    // Arrange: Create a new DTO and assign values to its properties.
    const dto = new UpdateCondominiumResponseDto();
    dto.id = 'test-id';
    dto.name = 'Test Condominium';
    dto.street = '456 Test Ave';
    dto.city = 'Testville';
    dto.updatedAt = new Date();

    // Assert: Verify that each property holds the correct value and type.
    expect(dto.id).toBe('test-id');
    expect(dto.name).toBe('Test Condominium');
    expect(dto.street).toBe('456 Test Ave');
    expect(dto.city).toBe('Testville');
    expect(dto.updatedAt).toBeInstanceOf(Date);
  });
});
