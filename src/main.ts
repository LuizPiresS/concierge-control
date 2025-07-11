import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // Importe

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // --- Início da Configuração do Swagger ---
  const config = new DocumentBuilder()
    .setTitle('Concierge Control API')
    .setDescription('Documentação da API para o sistema Concierge Control')
    .setVersion('1.0')
    .addTag('users', 'Operações relacionadas a usuários') // Adicione tags para agrupar endpoints
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Onde 'api' é a rota para a documentação
  // --- Fim da Configuração do Swagger ---

  await app.listen(3000);
}
void bootstrap();
