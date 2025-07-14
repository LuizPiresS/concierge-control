import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUseCase } from '../../../../../shared/domain/use-case.interface';
import { USER_REPOSITORY_TOKEN } from '../../../infrastructure/repositories/user.repository';
import { IUserRepository } from '../../../infrastructure/repositories/user.repository.interface';

type RemoveUserRequest = string; // A entrada é o ID
type RemoveUserResponse = boolean; // A saída é vazia

@Injectable()
export class RemoveUserUseCase
  implements IUseCase<RemoveUserRequest, RemoveUserResponse>
{
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: RemoveUserRequest): Promise<RemoveUserResponse> {
    const userExists = await this.userRepository.findByUnique({ id });
    if (!userExists) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    return await this.userRepository.delete({ id });
  }
}
