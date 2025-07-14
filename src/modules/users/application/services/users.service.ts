import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { CreateUserDto } from '../../presentation/http/dtos/create-user.dto';
import { UpdateUserDto } from '../../presentation/http/dtos/update-user.dto';
import { CreateUserUseCase } from '../use-cases/create-user/create-user.usecase';
import { FindAllUsersUseCase } from '../use-cases/find-all-users/find-all-users.usecase';
import { FindUserByIdUseCase } from '../use-cases/find-user-by-id/find-user-by-id.usecase';
import { UpdateUserUseCase } from '../use-cases/update-user/update-user.usecase';
import { RemoveUserUseCase } from '../use-cases/remove-user/remove-user.usecase';
import { FindUserByEmailUseCase } from '../use-cases/find-user-by-email/find-user-by-id.usecase';

@Injectable()
export class UserService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly removeUserUseCase: RemoveUserUseCase,
    private readonly findUserByEmailUseCase: FindUserByEmailUseCase,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.createUserUseCase.execute(createUserDto);
  }

  findAll() {
    // Esta chamada está correta após o ajuste no FindAllUsersUseCase para usar 'void'.
    return this.findAllUsersUseCase.execute();
  }

  findOne(id: string) {
    return this.findUserByIdUseCase.execute(id);
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    // Esta chamada está correta, passando um único objeto para o caso de uso.
    return this.updateUserUseCase.execute({ id, dto: updateUserDto });
  }

  remove(id: string): Promise<boolean> {
    return this.removeUserUseCase.execute(id);
  }

  findUserByEmail(email: string): Promise<User> {
    return this.findUserByEmailUseCase.execute(email);
  }
}
