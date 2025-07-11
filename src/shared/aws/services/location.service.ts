import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreatePlaceIndexCommand,
  DeletePlaceIndexCommand,
  DescribePlaceIndexCommand,
  ListPlaceIndexesCommand,
  LocationClient,
  SearchPlaceIndexForPositionCommand,
  SearchPlaceIndexForTextCommand,
} from '@aws-sdk/client-location';

export interface GeocodingResult {
  lat: number;
  lng: number;
  address: string;
  confidence?: string;
}

interface PlaceResult {
  Place?: { Geometry?: { Point?: number[] }; Label?: string };
}

export interface ReverseGeocodingResult {
  address: string;
  lat: number;
  lng: number;
  confidence?: string;
}

export interface CreatePlaceIndexOptions {
  indexName: string;
  dataSource: string;
  description?: string;
}

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);
  private readonly defaultIndexName: string;

  constructor(
    private readonly locationClient: LocationClient,
    private readonly configService: ConfigService,
  ) {
    this.defaultIndexName = this.configService.get<string>(
      'AWS_LOCATION_INDEX_NAME',
      'protect-sys-place-index',
    );
  }

  private _mapPlaceResults<T extends GeocodingResult | ReverseGeocodingResult>(
    responseResults: PlaceResult[] | undefined,
    defaultAddress: string,
  ): T[] {
    if (!responseResults) {
      return [];
    }

    const mappedResults: T[] = [];
    for (const result of responseResults) {
      if (result.Place?.Geometry?.Point) {
        const point = result.Place.Geometry.Point;
        mappedResults.push({
          lat: point[1], // Latitude
          lng: point[0], // Longitude
          address: result.Place.Label || defaultAddress,
        } as T);
      }
    }
    return mappedResults;
  }

  private _logAndThrow(error: unknown, context: string): never {
    const message = error instanceof Error ? error.message : String(error);
    this.logger.error(`${context}: ${message}`);
    throw error;
  }

  /**
   * Faz geocodificação de um endereço
   */
  async geocodeAddress(
    address: string,
    indexName?: string,
  ): Promise<GeocodingResult[]> {
    const command = new SearchPlaceIndexForTextCommand({
      IndexName: indexName || this.defaultIndexName,
      Text: address,
      MaxResults: 5,
    });

    try {
      const response = await this.locationClient.send(command);
      const results = this._mapPlaceResults<GeocodingResult>(
        response.Results,
        address,
      );

      this.logger.log(
        `Geocoded address "${address}" - found ${String(results.length)} results`,
      );
      return results;
    } catch (error) {
      this._logAndThrow(error, `Failed to geocode address "${address}"`);
    }
  }

  /**
   * Faz geocodificação reversa (coordenadas para endereço)
   */
  async reverseGeocode(
    lat: number,
    lng: number,
    indexName?: string,
  ): Promise<ReverseGeocodingResult[]> {
    const command = new SearchPlaceIndexForPositionCommand({
      IndexName: indexName || this.defaultIndexName,
      Position: [lng, lat], // [longitude, latitude]
      MaxResults: 5,
    });

    try {
      const response = await this.locationClient.send(command);
      const results = this._mapPlaceResults<ReverseGeocodingResult>(
        response.Results,
        'Endereço não encontrado',
      );

      this.logger.log(
        `Reverse geocoded coordinates [${String(lat)}, ${String(lng)}] - found ${String(results.length)} results`,
      );
      return results;
    } catch (error) {
      this._logAndThrow(
        error,
        `Failed to reverse geocode coordinates [${String(lat)}, ${String(lng)}]`,
      );
    }
  }

  /**
   * Cria um novo place index
   */
  async createPlaceIndex(options: CreatePlaceIndexOptions): Promise<string> {
    const command = new CreatePlaceIndexCommand({
      IndexName: options.indexName,
      DataSource: options.dataSource,
      Description: options.description,
    });

    try {
      const response = await this.locationClient.send(command);
      this.logger.log(`Place index created successfully: ${options.indexName}`);
      if (!response.IndexArn) {
        throw new Error('IndexArn is undefined in the response');
      }
      return response.IndexArn;
    } catch (error) {
      this._logAndThrow(
        error,
        `Failed to create place index ${options.indexName}`,
      );
    }
  }

  /**
   * Lista todos os place indexes
   */
  async listPlaceIndexes(): Promise<string[]> {
    const command = new ListPlaceIndexesCommand({});

    try {
      const response = await this.locationClient.send(command);
      const indexes =
        response.Entries?.map((entry) => entry.IndexName).filter(Boolean) || [];
      this.logger.log(`Listed ${String(indexes.length)} place indexes`);
      return indexes as string[];
    } catch (error) {
      this._logAndThrow(error, 'Failed to list place indexes');
    }
  }

  /**
   * Deleta um place index
   */
  async deletePlaceIndex(indexName: string): Promise<boolean> {
    const command = new DeletePlaceIndexCommand({
      IndexName: indexName,
    });

    try {
      await this.locationClient.send(command);
      this.logger.log(`Place index deleted successfully: ${indexName}`);
      return true;
    } catch (error) {
      this._logAndThrow(error, `Failed to delete place index ${indexName}`);
    }
  }

  /**
   * Geocodifica um endereço e retorna o primeiro resultado
   */
  async getCoordinates(
    address: string,
    indexName?: string,
  ): Promise<{ lat: number; lng: number }> {
    const results = await this.geocodeAddress(address, indexName);

    if (results.length === 0) {
      throw new Error(`No results found for address: ${address}`);
    }

    return {
      lat: results[0].lat,
      lng: results[0].lng,
    };
  }

  /**
   * Geocodifica um endereço completo (rua, número, bairro, cidade)
   */
  async geocodeFullAddress(
    street: string,
    number: string,
    neighborhood: string,
    city?: string,
  ): Promise<GeocodingResult[]> {
    const fullAddress = `${street}, ${number}, ${neighborhood}${city ? `, ${city}` : ''}`;
    return this.geocodeAddress(fullAddress);
  }

  /**
   * Calcula a distância entre dois pontos (fórmula de Haversine)
   */
  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Converte graus para radianos
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Verifica se um place index existe
   */
  async placeIndexExists(indexName: string): Promise<boolean> {
    const command = new DescribePlaceIndexCommand({ IndexName: indexName });

    try {
      await this.locationClient.send(command);
      return true;
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        (error as { name?: string }).name === 'ResourceNotFoundException'
      ) {
        return false;
      }
      // Para outros erros, logamos e relançamos
      this._logAndThrow(
        error,
        `Failed to check existence of place index ${indexName}`,
      );
    }
  }

  /**
   * Cria o place index padrão se não existir
   */
  async ensureDefaultPlaceIndex(): Promise<void> {
    if (!(await this.placeIndexExists(this.defaultIndexName))) {
      this.logger.log(`Creating default place index: ${this.defaultIndexName}`);
      await this.createPlaceIndex({
        indexName: this.defaultIndexName,
        dataSource: 'Here',
        description:
          'Place index padrão para geocodificação do Protect-Sys-ERP',
      });
    }
  }
}
