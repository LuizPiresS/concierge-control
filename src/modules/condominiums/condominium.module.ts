import { Module } from '@nestjs/common';
import { CondominiumService } from './application/services/condominium.service';
import { CondominiumController } from './presentation/http/controllers/condominium.controller';
import { CreateCondominiumUseCase } from './application/use-cases/create-condominium/create-condominium.usecase';
import { PrismaCondominiumRepository } from './infrastructure/repositories/prisma-condominium.repository';
import { CONDOMINIUM_REPOSITORY_TOKEN } from './domain/repositories/condominium.repository.interface';
import { NotificationsModule } from '../../shared/notifications/notifications.module';
import { PasswordGeneratorService } from '../../shared/utils/password-generator.service';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { UpdateCondominiumUseCase } from './application/use-cases/update-condominium/update-condominium.usecase';
import { CondominiumMapper } from './application/mappers/condominium.mapper';

@Module({
  imports: [
    NotificationsModule, // <-- A CORREÇÃO PRINCIPAL ESTÁ AQUI
  ],
  controllers: [CondominiumController],
  providers: [
    // Services
    CondominiumService,
    PasswordGeneratorService,
    PrismaService, // Dependência direta do UseCase
    // Use Cases
    CreateCondominiumUseCase,
    UpdateCondominiumUseCase, // <-- Adicione aqui
    CondominiumMapper,
    // Repositories
    {
      provide: CONDOMINIUM_REPOSITORY_TOKEN,
      useClass: PrismaCondominiumRepository,
    },
  ],
})
export class CondominiumModule {}
