import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { IUseCase } from '../../../../../shared/domain/use-case.interface';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../infrastructure/repositories/user.repository';
import { UpdateUserDto } from '../../../presentation/http/dtos/update-user.dto';
import { UserMapper } from '../../mappers/user.mapper';

// Tipos explícitos para a requisição e resposta do caso de uso
type UpdateUserRequest = {
  id: string;
  dto: UpdateUserDto;
};

type UpdateUserResponse = Omit<User, 'password'>;

@Injectable()
export class UpdateUserUseCase
  implements IUseCase<UpdateUserRequest, UpdateUserResponse>
{
  private readonly saltRounds = 10;

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(request: UpdateUserRequest): Promise<UpdateUserResponse> {
    // 1. Garante que o usuário existe
    const existingUser = await this.userRepository.findByUnique({
      id: request.id,
    });
    if (!existingUser) {
      throw new NotFoundException(
        `Usuário com ID ${request.id} não encontrado.`,
      );
    }

    // 2. Mapeia o DTO para o formato de atualização e hasheia a senha se necessário
    const dataToUpdate = this.userMapper.updateDtoToUpdateInput(request.dto);
    if (dataToUpdate.password && typeof dataToUpdate.password === 'string') {
      dataToUpdate.password = await bcrypt.hash(
        dataToUpdate.password,
        this.saltRounds,
      );
    }

    // 3. Atualiza o usuário e usa o mapper para retornar um objeto seguro
    const updatedUser = await this.userRepository.update(
      { id: request.id },
      dataToUpdate,
    );

    return this.userMapper.toSafeUser(updatedUser);
  }
}
