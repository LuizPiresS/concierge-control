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
import { FindAllCondominiumsUseCase } from './application/use-cases/find-all-condominiums/find-all-condominiums.usecase';
import { FindCondominiumUseCase } from './application/use-cases/find-condominium/find-condominium.usecase';
import { RemoveCondominiumUseCase } from './application/use-cases/remove-condominium/remove-condominium.usecase';

@Module({
  imports: [NotificationsModule],
  controllers: [CondominiumController],
  providers: [
    // Services
    CondominiumService,
    PasswordGeneratorService,
    PrismaService,
    // Use Cases
    CreateCondominiumUseCase,
    UpdateCondominiumUseCase,
    FindAllCondominiumsUseCase,
    FindCondominiumUseCase,
    RemoveCondominiumUseCase,
    // Mappers
    CondominiumMapper,
    // Repositories
    {
      provide: CONDOMINIUM_REPOSITORY_TOKEN,
      useClass: PrismaCondominiumRepository,
    },
  ],
})
export class CondominiumModule {}
