import { Prisma, User } from '@prisma/client';

// Esta interface define o "contrato" que o UserService espera.
// Ela inclui os métodos do GenericRepository e os métodos específicos do UserRepository.
export interface IUserRepository {
  create(data: Prisma.UserCreateInput): Promise<User>;
  findByUnique(where: Prisma.UserWhereUniqueInput): Promise<User | null>;
  update(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
  ): Promise<User>;
  delete(where: Prisma.UserWhereUniqueInput): Promise<boolean>;
  softDelete(where: Prisma.UserWhereUniqueInput): Promise<User>;
  findFirst(where: Prisma.UserWhereInput): Promise<User | null>;
  findMany(options?: Prisma.UserFindManyArgs): Promise<User[]>;
  count(where?: Prisma.UserWhereInput): Promise<number>;
  exists(where: Prisma.UserWhereInput): Promise<boolean>;
  findManyWithPagination(
    page: number,
    limit: number,
    where?: Prisma.UserWhereInput,
    orderBy?:
      | Prisma.UserOrderByWithRelationInput
      | Prisma.UserOrderByWithRelationInput[],
  ): Promise<{ data: User[]; total: number; page: number; limit: number }>;

  // Método específico do UserRepository
  findByEmail(email: string): Promise<User | null>;
}
