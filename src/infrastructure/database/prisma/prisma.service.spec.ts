import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { INestApplication } from '@nestjs/common';
import { jest } from '@jest/globals';

// Mock the INestApplication
const appMock = {
  close: jest.fn(),
};

describe('PrismaService', () => {
  let service: PrismaService;
  // --- A CORREÇÃO DEFINITIVA ---
  // Remova a declaração de tipo explícita. A variável será tipada
  // corretamente por inferência quando receber o valor de jest.spyOn.
  let processOnSpy;

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);

    jest.spyOn(service, '$connect').mockImplementation(async () => {});
    jest.spyOn(service, '$disconnect').mockImplementation(async () => {});

    // A mágica acontece aqui: TypeScript agora sabe que 'processOnSpy'
    // é do tipo 'jest.SpyInstance' porque é o que jest.spyOn retorna.
    processOnSpy = jest.spyOn(process, 'on');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call $connect', async () => {
      await service.onModuleInit();
      expect(service.$connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('onModuleDestroy', () => {
    it('should call $disconnect', async () => {
      await service.onModuleDestroy();
      expect(service.$disconnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('enableShutdownHooks', () => {
    it('should register a "beforeExit" event listener', () => {
      service.enableShutdownHooks(appMock as unknown as INestApplication);
      expect(processOnSpy).toHaveBeenCalledWith(
        'beforeExit',
        expect.any(Function),
      );
    });

    it('should call app.close() and $disconnect() when "beforeExit" is triggered', () => {
      // 1. Register the hook
      service.enableShutdownHooks(appMock as unknown as INestApplication);

      // 2. Get the callback function registered by the spy
      const beforeExitCallback = processOnSpy.mock.calls[0][1] as () => void;

      // 3. Execute the callback
      beforeExitCallback();

      // 4. Assert that the expected methods were called
      expect(appMock.close).toHaveBeenCalledTimes(1);
      expect(service.$disconnect).toHaveBeenCalledTimes(1);
    });
  });
});
