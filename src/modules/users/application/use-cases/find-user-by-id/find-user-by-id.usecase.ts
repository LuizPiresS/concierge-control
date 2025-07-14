import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { IUseCase } from '../../../../../shared/domain/use-case.interface';
import { USER_REPOSITORY_TOKEN } from '../../../infrastructure/repositories/user.repository';
import { IUserRepository } from '../../../infrastructure/repositories/user.repository.interface';

type FindUserByIdRequest = string; // A entrada é o ID
type FindUserByIdResponse = Omit<User, 'password'>;

@Injectable()
export class FindUserByIdUseCase
  implements IUseCase<FindUserByIdRequest, FindUserByIdResponse>
{
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  private excludePassword(user: User): FindUserByIdResponse {
    const { password: _password, ...result } = user;
    return result;
  }

  async execute(id: FindUserByIdRequest): Promise<FindUserByIdResponse> {
    const user = await this.userRepository.findByUnique({ id });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    return this.excludePassword(user);
  }
}
