// /src/modules/condominiums/condominium.module.ts

import { Module } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { UsersModule } from '../users/users.module'; // This import is crucial
import { CondominiumService } from './application/services/condominium.service';
import { CreateCondominiumUseCase } from './application/use-cases/create-condominium/create-condominium.usecase';
import { PrismaCondominiumRepository } from './infrastructure/repositories/prisma-condominium.repository';
import { CondominiumController } from './presentation/http/controllers/condominium.controller';
import {
  USER_REPOSITORY_TOKEN,
  UserRepository,
} from '../users/infrastructure/repositories/user.repository';
import { CONDOMINIUM_REPOSITORY_TOKEN } from './domain/repositories/condominium.repository.interface';

@Module({
  imports: [
    UsersModule, // Correct: Imports the module that exports CreateUserUseCase
  ],
  controllers: [CondominiumController],
  providers: [
    CondominiumService,
    CreateCondominiumUseCase,
    PrismaService,
    {
      provide: CONDOMINIUM_REPOSITORY_TOKEN,
      useClass: PrismaCondominiumRepository,
    },

    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepository,
    },
  ],
  exports: [CondominiumService],
})
export class CondominiumsModule {}
