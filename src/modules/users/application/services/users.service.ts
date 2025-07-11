import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { USER_REPOSITORY_TOKEN } from '../../infrastructure/repositories/user.repository';
import { IUserRepository } from '../../infrastructure/repositories/user.repository.interface';
import { CreateUserDto } from '../../presentation/http/dtos/create-user.dto';
import { UpdateUserDto } from '../../presentation/http/dtos/update-user.dto';

@Injectable()
export class UserService {
  // É uma boa prática definir o número de "salt rounds" para o bcrypt como uma constante.
  private readonly saltRounds = 10;

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Um método auxiliar privado para remover com segurança o campo de senha de um objeto de usuário.
   * NUNCA retorne o hash da senha para o cliente.
   * @param user O objeto de usuário do qual a senha será removida.
   * @returns Um objeto de usuário sem a propriedade 'password'.
   */
  private excludePassword<TUser extends User>(
    user: TUser,
  ): Omit<TUser, 'password'> {
    const { password: _password, ...result } = user;
    return result;
  }

  /**
   * Cria um novo usuário.
   * Realiza o hash da senha e verifica conflitos de e-mail.
   */
  async create(createUserDto: CreateUserDto) {
    // 1. Verifica se um usuário com este e-mail já existe para evitar duplicatas.
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Um usuário com este email já existe.');
    }

    // 2. Gera o hash da senha antes de salvar no banco de dados.
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.saltRounds,
    );

    // 3. Cria o novo usuário com a senha criptografada.
    const newUser = await this.userRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
    });

    // 4. Retorna o usuário recém-criado, garantindo que a senha seja omitida.
    return this.excludePassword(newUser);
  }

  /**
   * Encontra todos os usuários.
   * Em uma aplicação real, considere adicionar paginação aqui.
   */
  async findAll() {
    const users = await this.userRepository.findMany();
    // Mapeia a lista de usuários para remover a senha de cada um.
    return users.map((user) => this.excludePassword(user));
  }

  /**
   * Encontra um único usuário pelo seu ID.
   * Lança uma exceção NotFoundException se o usuário não existir.
   */
  async findOne(id: string) {
    // ALTERADO: Use 'findByUnique' que é projetado para chaves únicas.
    // Isso alinha a intenção do serviço com a capacidade do repositório
    // e resolve o problema de aninhamento.
    const user = await this.userRepository.findByUnique({ id });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }
    return this.excludePassword(user);
  }

  /**
   * Atualiza os dados de um usuário.
   * Se uma nova senha for fornecida, ela será criptografada.
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    // 1. Garante que o usuário exista antes de tentar atualizar.
    //    Isso reutiliza a lógica do findOne e a verificação de 'não encontrado'.
    await this.findOne(id);

    // 2. Prepara os dados para a atualização.
    const dataToUpdate: Prisma.UserUpdateInput = updateUserDto;

    // 3. Se uma nova senha estiver no DTO, faz o hash dela.
    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(
        updateUserDto.password,
        this.saltRounds,
      );
    }

    // 4. Realiza a atualização no repositório.
    const updatedUser = await this.userRepository.update({ id }, dataToUpdate);

    // 5. Retorna o usuário atualizado, sem a senha.
    return this.excludePassword(updatedUser);
  }

  /**
   * Remove um usuário pelo seu ID.
   */
  async remove(id: string): Promise<void> {
    // 1. Garante que o usuário exista antes de tentar deletar.
    await this.findOne(id);

    // 2. Realiza a exclusão.
    await this.userRepository.delete({ id });

    // O controller espera um status 204 No Content, então não precisamos retornar nada.
  }

  /**
   * Encontra um usuário pelo e-mail.
   * Este método é útil para lógicas internas, como autenticação,
   * onde podemos precisar do objeto completo do usuário (incluindo a senha para comparação).
   */
  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`Usuário com email ${email} não encontrado.`);
    }
    // Para uso interno, retornamos o objeto completo.
    return user;
  }
}
