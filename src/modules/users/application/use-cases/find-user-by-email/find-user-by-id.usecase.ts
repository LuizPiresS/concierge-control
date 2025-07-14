import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';

import { USER_REPOSITORY_TOKEN } from '../../../infrastructure/repositories/user.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class FindUserByEmailUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`Usuário com email ${email} não encontrado.`);
    }

    // Para uso interno, retornamos o objeto completo, incluindo a senha.
    return user;
  }
}
