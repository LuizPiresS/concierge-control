import { Module } from '@nestjs/common';
import { UserService } from './application/services/users.service';
import {
  USER_REPOSITORY_TOKEN,
  UserRepository,
} from './infrastructure/repositories/user.repository';
import { CreateUserUseCase } from './application/use-cases/create-user/create-user.usecase';
import { FindAllUsersUseCase } from './application/use-cases/find-all-users/find-all-users.usecase';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id/find-user-by-id.usecase';
import { UpdateUserUseCase } from './application/use-cases/update-user/update-user.usecase';
import { RemoveUserUseCase } from './application/use-cases/remove-user/remove-user.usecase';
import { FindUserByEmailUseCase } from './application/use-cases/find-user-by-email/find-user-by-id.usecase';
import { UserMapper } from './application/mappers/user.mapper';
import { UsersController } from './presentation/http/controllers/users.controller';
// --- ADICIONE ESTE IMPORT ---
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';

@Module({
  // --- ADICIONE O PRISMA MODULE AQUI ---
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    UserService,
    CreateUserUseCase,
    FindAllUsersUseCase,
    FindUserByIdUseCase,
    UpdateUserUseCase,
    RemoveUserUseCase,
    FindUserByEmailUseCase,
    UserMapper,
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepository,
    },
  ],
  exports: [UserService, CreateUserUseCase],
})
export class UsersModule {}
