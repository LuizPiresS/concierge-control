import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { IUseCase } from '../../../../../shared/domain/use-case.interface';
import { USER_REPOSITORY_TOKEN } from '../../../infrastructure/repositories/user.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { UpdateUserDto } from '../../../presentation/http/dtos/update-user.dto';
import { UserMapper } from '../../mappers/user.mapper';

// Agrupamos 'id' e 'dto' em um único objeto de request
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

  private excludePassword(user: User): UpdateUserResponse {
    const { password: _password, ...result } = user;
    return result;
  }

  async execute(request: UpdateUserRequest): Promise<UpdateUserResponse> {
    const { id, dto } = request;

    const userExists = await this.userRepository.findByUnique({ id });
    if (!userExists) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    const dataToUpdate = this.userMapper.updateDtoToUpdateInput(dto);

    if (dataToUpdate.password && typeof dataToUpdate.password === 'string') {
      dataToUpdate.password = await bcrypt.hash(
        dataToUpdate.password,
        this.saltRounds,
      );
    }

    const updatedUser = await this.userRepository.update({ id }, dataToUpdate);

    return this.excludePassword(updatedUser);
  }
}
