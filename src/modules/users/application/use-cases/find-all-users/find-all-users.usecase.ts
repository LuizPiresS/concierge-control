import { Inject, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { USER_REPOSITORY_TOKEN } from '../../../infrastructure/repositories/user.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { IUseCase } from '../../../../../shared/domain/use-case.interface';

// Esta definição está 100% correta com a nova interface
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
type FindAllUsersRequest = void;
type FindAllUsersResponse = Omit<User, 'password'>[];

@Injectable()
export class FindAllUsersUseCase
  implements IUseCase<FindAllUsersRequest, FindAllUsersResponse>
{
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  private excludePassword(user: User): Omit<User, 'password'> {
    const { password: _password, ...result } = user;
    return result;
  }

  // Esta assinatura sem argumentos agora é válida e não deve mais apresentar erro.
  async execute(): Promise<FindAllUsersResponse> {
    const users = await this.userRepository.findMany();
    return users.map((user) => this.excludePassword(user));
  }
}
