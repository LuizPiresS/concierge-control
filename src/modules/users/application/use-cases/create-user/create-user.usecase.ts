import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY_TOKEN } from '../../../infrastructure/repositories/user.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { CreateUserDto } from '../../../presentation/http/dtos/create-user.dto';
import { User } from '@prisma/client';
import { IUseCase } from '../../../../../shared/domain/use-case.interface';

// 2. Defina tipos explícitos para a entrada e saída do caso de uso
type CreateUserRequest = CreateUserDto;
type CreateUserResponse = Omit<User, 'password'>;

@Injectable()
// 3. Implemente a interface genérica com os tipos definidos
export class CreateUserUseCase
  implements IUseCase<CreateUserRequest, CreateUserResponse>
{
  private readonly saltRounds = 10;

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  private excludePassword(user: User): CreateUserResponse {
    const { password: _password, ...result } = user;
    return result;
  }

  // 4. O método 'execute' agora segue o contrato da interface
  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new ConflictException('Um usuário com este email já existe.');
    }

    const hashedPassword = await bcrypt.hash(request.password, this.saltRounds);

    const newUser = await this.userRepository.create({
      email: request.email,
      password: hashedPassword,
    });

    return this.excludePassword(newUser);
  }
}
