import { Prisma } from '@prisma/client';

/**
 * Define o contrato para um repositório genérico, alinhado com os tipos do Prisma.
 * Esta é a base para todos os repositórios da aplicação, garantindo consistência.
 *
 * @template T - O tipo da entidade do Prisma (ex: `User`).
 * @template WhereInput - O tipo do filtro de busca (ex: `Prisma.UserWhereInput`).
 * @template WhereUniqueInput - O tipo do filtro para campos únicos (ex: `Prisma.UserWhereUniqueInput`).
 * @template CreateInput - O tipo de dado para criação (ex: `Prisma.UserCreateInput`).
 * @template UpdateInput - O tipo de dado para atualização (ex: `Prisma.UserUpdateInput`).
 * @template FindManyArgs - O tipo completo dos argumentos para `findMany` (ex: `Prisma.UserFindManyArgs`).
 */
export interface IGenericRepository<
  T, // Entity Type
  WhereInput, // e.g., Prisma.CondominiumWhereInput
  WhereUniqueInput, // e.g., Prisma.CondominiumWhereUniqueInput
  CreateInput, // e.g., Prisma.CondominiumCreateInput
  UpdateInput, // e.g., Prisma.CondominiumUpdateInput
  FindManyArgs extends { orderBy?: any } = Prisma.Args<T, 'findMany'>, // e.g., Prisma.CondominiumFindManyArgs
> {
  // Métodos básicos de CRUD usando filtros únicos
  create(data: CreateInput): Promise<T>;
  findByUnique(where: WhereUniqueInput): Promise<T | null>;
  update(where: WhereUniqueInput, data: UpdateInput): Promise<T>;
  delete(where: WhereUniqueInput): Promise<boolean>;
  softDelete(where: WhereUniqueInput): Promise<T>;

  // Métodos de busca que usam filtros mais amplos
  findFirst(where: WhereInput): Promise<T | null>;
  findMany(options?: FindManyArgs): Promise<T[]>;
  count(where?: WhereInput): Promise<number>;
  exists(where: WhereInput): Promise<boolean>;
  findManyWithPagination(
    page?: number,
    limit?: number,
    where?: WhereInput,
    orderBy?: FindManyArgs['orderBy'],
  ): Promise<{ data: T[]; total: number; page: number; limit: number }>;
}
