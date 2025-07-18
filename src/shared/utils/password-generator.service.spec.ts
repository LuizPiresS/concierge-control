import { Test, TestingModule } from '@nestjs/testing';
import { PasswordGeneratorService } from './password-generator.service';
import * as crypto from 'crypto';

// We mock the entire 'crypto' module.
// This allows us to control the output of `randomBytes` for predictable testing.
jest.mock('crypto', () => ({
  // We keep the original implementations of other crypto functions
  ...jest.requireActual('crypto'),
  // but we provide a mock for `randomBytes`
  randomBytes: jest.fn((size: number): Buffer => {
    // For our tests, we'll return a predictable, sequential buffer.
    const buffer = Buffer.alloc(size);
    for (let i = 0; i < size; i++) {
      // Each byte will be its own index (0, 1, 2, ...).
      // This makes the output of the password generator predictable.
      buffer[i] = i;
    }
    return buffer;
  }),
}));

describe('PasswordGeneratorService', () => {
  let service: PasswordGeneratorService;
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordGeneratorService],
    }).compile();

    service = module.get<PasswordGeneratorService>(PasswordGeneratorService);

    // It's good practice to clear mocks before each test to ensure they are isolated.
    (crypto.randomBytes as jest.Mock).mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generate', () => {
    it('should generate a password with the default length of 12', () => {
      const password = service.generate();
      expect(password).toHaveLength(12);
      expect(typeof password).toBe('string');
      // Ensure crypto.randomBytes was called with the correct length
      expect(crypto.randomBytes).toHaveBeenCalledWith(12);
    });

    it('should generate a password with a specified length', () => {
      const length = 20;
      const password = service.generate(length);
      expect(password).toHaveLength(length);
      expect(crypto.randomBytes).toHaveBeenCalledWith(length);
    });

    it('should generate an empty string if length is 0', () => {
      const password = service.generate(0);
      expect(password).toBe('');
      expect(password).toHaveLength(0);
      // It should not call randomBytes if length is 0
      expect(crypto.randomBytes).not.toHaveBeenCalled();
    });

    it('should generate a predictable password when crypto.randomBytes is mocked', () => {
      // Our mock generates bytes [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      // This will map to the first 10 characters of the charset.
      const expectedPassword = charset.substring(0, 10);
      const password = service.generate(10);

      expect(password).toBe(expectedPassword);
      expect(crypto.randomBytes).toHaveBeenCalledWith(10);
    });

    it('should only use characters from the defined charset', () => {
      const password = service.generate(50);
      // Create a regular expression from the charset to validate the password
      // We must escape special regex characters within the charset string
      const escapedCharset = charset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const charsetRegex = new RegExp(`^[${escapedCharset}]+$`);

      // An empty string should not fail this test
      if (password.length > 0) {
        expect(password).toMatch(charsetRegex);
      }
    });

    it('should generate different passwords on subsequent calls (testing with real randomness)', () => {
      // For this specific test, we want to use the REAL crypto.randomBytes
      // to ensure the function is not deterministic in production.
      (crypto.randomBytes as jest.Mock).mockImplementation(
        jest.requireActual('crypto').randomBytes,
      );

      const passwordA = service.generate(16);
      const passwordB = service.generate(16);

      expect(passwordA).not.toEqual(passwordB);
      expect(passwordA).toHaveLength(16);
      expect(passwordB).toHaveLength(16);
    });
  });
});
