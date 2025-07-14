import { Module } from '@nestjs/common';
import { CondominiumService } from './application/services/condominium.service';
import { CondominiumController } from './presentation/http/controllers/condominium.controller';
import { CONDOMINIUM_REPOSITORY_TOKEN } from './domain/repositories/condominium.repository.interface';
import { PrismaCondominiumRepository } from './infrastructure/repositories/prisma-condominium.repository';
import { CreateCondominiumUseCase } from './application/use-cases/create-condominium/create-condominium.usecase';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';

@Module({
  // By importing PrismaModule, you make all its exported providers,
  // including PrismaService, available for injection within this module.
  imports: [PrismaModule],
  controllers: [CondominiumController],
  providers: [
    CondominiumService,
    // Add other use cases here as you create them
    CreateCondominiumUseCase,
    {
      provide: CONDOMINIUM_REPOSITORY_TOKEN,
      useClass: PrismaCondominiumRepository,
    },
  ],
  exports: [CondominiumService],
})
export class CondominiumModule {}
