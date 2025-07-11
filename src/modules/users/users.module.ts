import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'; // Ou seu PrismaModule

import { UserService } from './application/services/users.service';
import {
  USER_REPOSITORY_TOKEN,
  UserRepository,
} from './infrastructure/repositories/user.repository';
import { UserController } from './presentation/http/controllers/users.controller';

@Module({
  controllers: [UserController],
  providers: [
    PrismaClient,

    UserService,
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepository,
    },
  ],
  // Exporte o provider para que outros módulos possam injetar IUserRepository
  exports: [UserService],
})
export class UsersModule {}
