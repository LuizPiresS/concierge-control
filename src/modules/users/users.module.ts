import { Module } from '@nestjs/common';
import { UserService } from './application/services/users.service';

// 1. Importe o token do repositório e sua implementação
import {
  USER_REPOSITORY_TOKEN,
  UserRepository,
} from './infrastructure/repositories/user.repository'; // Ajuste o caminho se você moveu para o domain // Ajuste para o nome da sua classe de implementação (ex: PrismaUserRepository)
// 2. Importe todos os seus casos de uso e o mapper
import { CreateUserUseCase } from './application/use-cases/create-user/create-user.usecase';
import { FindAllUsersUseCase } from './application/use-cases/find-all-users/find-all-users.usecase';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id/find-user-by-id.usecase';
import { UpdateUserUseCase } from './application/use-cases/update-user/update-user.usecase';
import { RemoveUserUseCase } from './application/use-cases/remove-user/remove-user.usecase';
import { FindUserByEmailUseCase } from './application/use-cases/find-user-by-email/find-user-by-id.usecase'; // Verifique este caminho
import { UserMapper } from './application/mappers/user.mapper';
import { UsersController } from './presentation/http/controllers/users.controller';

@Module({
  controllers: [UsersController],
  providers: [
    // O serviço que orquestra os casos de uso
    UserService,

    // 3. Registre todos os casos de uso como providers
    CreateUserUseCase,
    FindAllUsersUseCase,
    FindUserByIdUseCase,
    UpdateUserUseCase,
    RemoveUserUseCase,
    FindUserByEmailUseCase,

    // 4. Registre o mapper como provider
    UserMapper,

    // 5. Configure a injeção de dependência para o repositório
    //    Isso diz ao NestJS: "Quando alguém pedir por USER_REPOSITORY_TOKEN,
    //    forneça uma instância da classe UserRepository".
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepository, // Use o nome da sua classe de implementação (ex: PrismaUserRepository)
    },
  ],
  // Exporte o UserService se outros módulos precisarem usá-lo
  exports: [UserService],
})
export class UsersModule {}
