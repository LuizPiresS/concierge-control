import { Global, Module, Logger, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { LocationClient, LocationClientConfig } from '@aws-sdk/client-location';
import { S3Service } from './services/s3.service';
import { LocationService } from './services/location.service';

function getEnvString(
  configService: ConfigService,
  key: string,
  defaultValue: string,
): string {
  const value = configService.get<string>(key, defaultValue);
  if (typeof value !== 'string' || !value) {
    throw new Error(`Variável de ambiente ${key} não encontrada ou inválida`);
  }
  return value;
}

type AwsClientConstructor<TClient, TConfig> = new (config: TConfig) => TClient;

type AwsClientConfig = S3ClientConfig | LocationClientConfig;

function createAwsClientProvider<TClient, TConfig extends AwsClientConfig>(
  clientConstructor: AwsClientConstructor<TClient, TConfig>,
  endpointEnvKey: string,
  extraConfig: Partial<TConfig> = {},
): Provider<TClient> {
  return {
    provide: clientConstructor,
    useFactory: (configService: ConfigService): TClient => {
      const logger = new Logger(clientConstructor.name);

      const region = getEnvString(configService, 'AWS_REGION', 'us-east-1');
      const accessKeyId = getEnvString(
        configService,
        'AWS_ACCESS_KEY_ID',
        'test',
      );
      const secretAccessKey = getEnvString(
        configService,
        'AWS_SECRET_ACCESS_KEY',
        'test',
      );
      const endpoint = getEnvString(
        configService,
        endpointEnvKey,
        'http://localhost:4566',
      );

      const clientConfig = {
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        endpoint,
        ...extraConfig,
      } as TConfig;

      logger.log(
        'Client configured with endpoint:',
        typeof clientConfig.endpoint === 'string'
          ? clientConfig.endpoint
          : JSON.stringify(clientConfig.endpoint),
      );

      return new clientConstructor(clientConfig);
    },
    inject: [ConfigService],
  };
}

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    createAwsClientProvider(S3Client, 'AWS_S3_ENDPOINT', {
      forcePathStyle: true, // Necessário para LocalStack
    }),
    createAwsClientProvider(LocationClient, 'AWS_LOCATION_ENDPOINT'),
    S3Service,
    LocationService,
  ],
  exports: [S3Service, LocationService],
})
export class AWSModule {}
