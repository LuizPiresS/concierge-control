import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY_TOKEN } from '../../../infrastructure/repositories/user.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { CreateUserDto } from '../../../presentation/http/dtos/create-user.dto';
import { User } from '@prisma/client';
import { IUseCase } from '../../../../../shared/domain/use-case.interface';
import { UserMapper } from '../../mappers/user.mapper';

// Tipos explícitos para a entrada e saída do caso de uso.
type CreateUserRequest = CreateUserDto;
type CreateUserResponse = Omit<User, 'password'>;

@Injectable()
export class CreateUserUseCase
  implements IUseCase<CreateUserRequest, CreateUserResponse>
{
  private readonly saltRounds = 10;

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new ConflictException('Um usuário com este email já existe.');
    }

    const hashedPassword = await bcrypt.hash(request.password, this.saltRounds);

    // Em vez de passar 'condominiumId' diretamente, usamos a sintaxe 'connect'
    // do Prisma no campo da relação ('condominium').
    const newUser = await this.userRepository.create({
      email: request.email,
      password: hashedPassword,
      condominium: {
        connect: {
          id: request.condominiumId,
        },
      },
    });

    // Utilizar o mapper para remover a senha antes de retornar.
    return this.userMapper.toSafeUser(newUser);
  }
}
