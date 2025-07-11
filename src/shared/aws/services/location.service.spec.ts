import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import {
  CreatePlaceIndexCommand,
  DeletePlaceIndexCommand,
  DescribePlaceIndexCommand,
  ListPlaceIndexesCommand,
  LocationClient,
  SearchPlaceIndexForPositionCommand,
  SearchPlaceIndexForTextCommand,
} from '@aws-sdk/client-location';
import type {
  GeocodingResult,
  ReverseGeocodingResult,
} from './location.service';
import { LocationService } from './location.service';

// Mock the AWS LocationClient
const mockLocationClient = {
  send: jest.fn(),
};

// Mock the ConfigService
const mockConfigService = {
  get: jest.fn(),
};

describe('LocationService', () => {
  let service: LocationService;
  let locationClient: typeof mockLocationClient;
  let configService: typeof mockConfigService;

  const DEFAULT_INDEX_NAME = 'test-default-index';

  beforeEach(async () => {
    // Suppress logger output during tests
    jest.spyOn(Logger, 'log').mockImplementation(() => {});
    jest.spyOn(Logger, 'error').mockImplementation(() => {});

    // --- CORRECTION 1: Configure mocks BEFORE compiling the module ---
    jest.clearAllMocks();
    mockConfigService.get.mockReturnValue(DEFAULT_INDEX_NAME);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: LocationClient,
          useValue: mockLocationClient,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService, // Use the pre-configured mock
        },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
    locationClient = module.get(LocationClient);
    configService = module.get(ConfigService);
    // The line that assigned to a readonly property is no longer needed.
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should set defaultIndexName from ConfigService', () => {
      // This test now verifies the constructor worked correctly during module setup
      expect(configService.get).toHaveBeenCalledWith(
        'AWS_LOCATION_INDEX_NAME',
        'protect-sys-place-index',
      );
      expect(service['defaultIndexName']).toBe(DEFAULT_INDEX_NAME);
    });
  });

  // ... (geocodeAddress and reverseGeocode tests are correct) ...
  describe('geocodeAddress', () => {
    it('should geocode an address and return mapped results', async () => {
      const address = '123 Main St';
      const mockResponse = {
        Results: [
          {
            Place: {
              Geometry: { Point: [-74.006, 40.7128] },
              Label: '123 Main St, New York, NY',
            },
          },
        ],
      };
      locationClient.send.mockResolvedValue(mockResponse);

      const results = await service.geocodeAddress(address);

      expect(locationClient.send).toHaveBeenCalledWith(
        expect.any(SearchPlaceIndexForTextCommand),
      );
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual<GeocodingResult>({
        lat: 40.7128,
        lng: -74.006,
        address: '123 Main St, New York, NY',
      });
    });

    it('should use a custom index name if provided', async () => {
      const customIndex = 'my-custom-index';
      locationClient.send.mockResolvedValue({ Results: [] });

      await service.geocodeAddress('any address', customIndex);

      const sentCommand = locationClient.send.mock.calls[0][0];
      expect(sentCommand.input.IndexName).toBe(customIndex);
    });

    it('should return an empty array if no results are found', async () => {
      locationClient.send.mockResolvedValue({ Results: [] });
      const results = await service.geocodeAddress('unknown address');
      expect(results).toEqual([]);
    });

    it('should throw an error if the AWS call fails', async () => {
      const error = new Error('AWS API Error');
      locationClient.send.mockRejectedValue(error);

      await expect(service.geocodeAddress('any address')).rejects.toThrow(
        'AWS API Error',
      );
    });
  });

  describe('reverseGeocode', () => {
    it('should reverse geocode coordinates and return mapped results', async () => {
      const lat = 40.7128;
      const lng = -74.006;
      const mockResponse = {
        Results: [
          {
            Place: {
              Geometry: { Point: [lng, lat] },
              Label: '123 Main St, New York, NY',
            },
          },
        ],
      };
      locationClient.send.mockResolvedValue(mockResponse);

      const results = await service.reverseGeocode(lat, lng);

      expect(locationClient.send).toHaveBeenCalledWith(
        expect.any(SearchPlaceIndexForPositionCommand),
      );
      const sentCommand = locationClient.send.mock.calls[0][0];
      expect(sentCommand.input.Position).toEqual([lng, lat]);
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual<ReverseGeocodingResult>({
        lat,
        lng,
        address: '123 Main St, New York, NY',
      });
    });

    it('should throw an error if the AWS call fails', async () => {
      const error = new Error('AWS API Error');
      locationClient.send.mockRejectedValue(error);

      await expect(service.reverseGeocode(0, 0)).rejects.toThrow(
        'AWS API Error',
      );
    });
  });

  describe('createPlaceIndex', () => {
    it('should create a place index and return its ARN', async () => {
      const options = {
        indexName: 'new-index',
        dataSource: 'Here',
        description: 'A new index',
      };
      const mockResponse = { IndexArn: 'arn:aws:geo:...' };
      locationClient.send.mockResolvedValue(mockResponse);

      const result = await service.createPlaceIndex(options);

      expect(locationClient.send).toHaveBeenCalledWith(
        expect.any(CreatePlaceIndexCommand),
      );
      expect(result).toBe(mockResponse.IndexArn);
    });

    it('should throw an error if IndexArn is missing in the response', async () => {
      const options = { indexName: 'new-index', dataSource: 'Here' };
      locationClient.send.mockResolvedValue({ IndexArn: undefined });

      await expect(service.createPlaceIndex(options)).rejects.toThrow(
        'IndexArn is undefined in the response',
      );
    });
  });

  describe('listPlaceIndexes', () => {
    it('should list all place indexes', async () => {
      const mockResponse = {
        Entries: [{ IndexName: 'index1' }, { IndexName: 'index2' }],
      };
      locationClient.send.mockResolvedValue(mockResponse);

      const result = await service.listPlaceIndexes();

      expect(locationClient.send).toHaveBeenCalledWith(
        expect.any(ListPlaceIndexesCommand),
      );
      expect(result).toEqual(['index1', 'index2']);
    });
  });

  describe('deletePlaceIndex', () => {
    it('should delete a place index and return true', async () => {
      locationClient.send.mockResolvedValue({});
      const indexName = 'index-to-delete';

      const result = await service.deletePlaceIndex(indexName);

      expect(locationClient.send).toHaveBeenCalledWith(
        expect.any(DeletePlaceIndexCommand),
      );
      const sentCommand = locationClient.send.mock.calls[0][0];
      expect(sentCommand.input.IndexName).toBe(indexName);
      expect(result).toBe(true);
    });
  });

  describe('getCoordinates', () => {
    it('should return the coordinates of the first geocoding result', async () => {
      const mockResults: GeocodingResult[] = [
        { lat: 10, lng: 20, address: 'addr1' },
        { lat: 30, lng: 40, address: 'addr2' },
      ];
      const geocodeSpy = jest
        .spyOn(service, 'geocodeAddress')
        .mockResolvedValue(mockResults);

      const result = await service.getCoordinates('some address');

      expect(geocodeSpy).toHaveBeenCalledWith('some address', undefined);
      expect(result).toEqual({ lat: 10, lng: 20 });
    });

    it('should throw an error if no results are found', async () => {
      jest.spyOn(service, 'geocodeAddress').mockResolvedValue([]);

      await expect(
        service.getCoordinates('nonexistent address'),
      ).rejects.toThrow('No results found for address: nonexistent address');
    });
  });

  describe('geocodeFullAddress', () => {
    it('should call geocodeAddress with a formatted string', async () => {
      const geocodeSpy = jest
        .spyOn(service, 'geocodeAddress')
        .mockResolvedValue([]);
      const street = 'Rua Principal';
      const number = '123';
      const neighborhood = 'Centro';
      const city = 'Cidade';

      await service.geocodeFullAddress(street, number, neighborhood, city);

      expect(geocodeSpy).toHaveBeenCalledWith(
        'Rua Principal, 123, Centro, Cidade',
      );
    });

    it('should format the address correctly without a city', async () => {
      const geocodeSpy = jest
        .spyOn(service, 'geocodeAddress')
        .mockResolvedValue([]);
      const street = 'Rua Principal';
      const number = '123';
      const neighborhood = 'Centro';

      await service.geocodeFullAddress(street, number, neighborhood);

      expect(geocodeSpy).toHaveBeenCalledWith('Rua Principal, 123, Centro');
    });
  });

  describe('calculateDistance', () => {
    it('should calculate the distance between two points correctly', () => {
      // A known distance, e.g., Paris to London (~344km)
      const lat1 = 48.8566; // Paris
      const lng1 = 2.3522;
      const lat2 = 51.5074; // London
      const lng2 = -0.1278;

      const distance = service.calculateDistance(lat1, lng1, lat2, lng2);

      // CORREÇÃO: Ajustamos a expectativa para ser mais alinhada com o valor real e o comentário.
      // Agora verificamos se o valor é próximo de 344 com 0 casas decimais de precisão.
      expect(distance).toBeCloseTo(344, 0);
    });

    it('should return 0 for the same point', () => {
      const distance = service.calculateDistance(10, 20, 10, 20);
      expect(distance).toBe(0);
    });
  });

  describe('placeIndexExists', () => {
    it('should return true if the index exists', async () => {
      locationClient.send.mockResolvedValue({});
      const result = await service.placeIndexExists('existing-index');
      expect(locationClient.send).toHaveBeenCalledWith(
        expect.any(DescribePlaceIndexCommand),
      );
      expect(result).toBe(true);
    });

    it('should return false if the index does not exist (ResourceNotFoundException)', async () => {
      // --- A SOLUÇÃO DEFINITIVA: Crie um objeto de erro simples ---
      // Isso evita os problemas do construtor e testa diretamente o que o seu código verifica.
      const notFoundError = {
        name: 'ResourceNotFoundException',
        $metadata: {},
        message: 'Resource not found', // A mensagem em si não é crítica para a lógica do teste
      };

      locationClient.send.mockRejectedValue(notFoundError);

      const result = await service.placeIndexExists('non-existing-index');
      expect(result).toBe(false);
    });

    it('should re-throw other errors', async () => {
      const error = new Error('Some other AWS error');
      locationClient.send.mockRejectedValue(error);
      await expect(service.placeIndexExists('any-index')).rejects.toThrow(
        'Some other AWS error',
      );
    });
  });

  // ... (resto do código do teste)

  describe('ensureDefaultPlaceIndex', () => {
    it('should not create an index if the default one already exists', async () => {
      const existsSpy = jest
        .spyOn(service, 'placeIndexExists')
        .mockResolvedValue(true);
      const createSpy = jest.spyOn(service, 'createPlaceIndex');

      await service.ensureDefaultPlaceIndex();

      expect(existsSpy).toHaveBeenCalledWith(DEFAULT_INDEX_NAME);
      expect(createSpy).not.toHaveBeenCalled();
    });

    it('should create an index if the default one does not exist', async () => {
      const existsSpy = jest
        .spyOn(service, 'placeIndexExists')
        .mockResolvedValue(false);
      const createSpy = jest
        .spyOn(service, 'createPlaceIndex')
        .mockResolvedValue('arn:...');

      await service.ensureDefaultPlaceIndex();

      expect(existsSpy).toHaveBeenCalledWith(DEFAULT_INDEX_NAME);
      expect(createSpy).toHaveBeenCalledWith({
        indexName: DEFAULT_INDEX_NAME,
        dataSource: 'Here',
        description:
          'Place index padrão para geocodificação do Protect-Sys-ERP',
      });
    });
  });
});
