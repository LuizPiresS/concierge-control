import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

import { GenericRepository } from '../../../../infrastructure/database/prisma/repositories/generic-repository/generic.repository';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';

export const USER_REPOSITORY_TOKEN = Symbol('IUserRepository');

@Injectable()
export class UserRepository
  extends GenericRepository<
    User,
    Prisma.UserWhereUniqueInput,
    Prisma.UserWhereInput,
    Prisma.UserCreateInput,
    Prisma.UserUpdateInput
  >
  implements IUserRepository
{
  // Changed from PrismaClient to PrismaService for consistency
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // A implementação do método abstrato é a chave para este padrão funcionar.
  protected getModel() {
    return this.prisma.user;
  }

  // Métodos específicos do usuário continuam aqui.
  async findByEmail(email: string): Promise<User | null> {
    // Usa o método herdado `findFirst`, que é mais apropriado para campos
    // que, embora únicos no schema, não são a chave primária.
    return this.findFirst({ email });
  }
}
