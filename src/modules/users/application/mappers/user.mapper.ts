import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { UpdateUserDto } from '../../presentation/http/dtos/update-user.dto';

/**
 * Responsável por transformar (mapear) objetos de usuário entre diferentes formatos.
 * Atua como um "hub de tradução" para a entidade User, garantindo que a lógica
 * de transformação seja centralizada, testável e reutilizável.
 */
@Injectable()
export class UserMapper {
  /**
   * Converte um UpdateUserDto para o tipo de entrada de atualização do Prisma.
   * Garante que apenas os campos definidos no DTO sejam passados para a camada de dados.
   * @param dto O Data Transfer Object recebido do controller.
   * @returns Um objeto formatado para o método `update` do Prisma.
   */
  updateDtoToUpdateInput(dto: UpdateUserDto): Prisma.UserUpdateInput {
    const dataToUpdate: Prisma.UserUpdateInput = {};

    if (dto.email !== undefined) {
      dataToUpdate.email = dto.email;
    }

    if (dto.password !== undefined) {
      dataToUpdate.password = dto.password;
    }

    return dataToUpdate;
  }

  /**
   * Converte uma entidade User completa em um objeto seguro, omitindo a senha.
   * Este método substitui a função privada que se repetia nos casos de uso.
   * @param user A entidade User completa vinda do banco de dados.
   * @returns Um objeto User sem a propriedade 'password'.
   */
  toSafeUser(user: User): Omit<User, 'password'> {
    // A desestruturação é uma forma limpa e eficiente de remover a propriedade.
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Converte uma lista de entidades User em uma lista de objetos seguros.
   * Utiliza o método toSafeUser para garantir consistência.
   * @param users Uma lista de entidades User.
   * @returns Uma lista de objetos User sem a propriedade 'password'.
   */
  toSafeUserList(users: User[]): Omit<User, 'password'>[] {
    return users.map((user) => this.toSafeUser(user));
  }
}
