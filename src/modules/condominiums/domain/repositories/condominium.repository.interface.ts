import { Condominium, Prisma } from '@prisma/client';
import { IGenericRepository } from '../../../../infrastructure/database/prisma/repositories/generic-repository/interfaces/generic-repository.interface';

export const CONDOMINIUM_REPOSITORY_TOKEN = Symbol('ICondominiumRepository');

export interface ICondominiumRepository
  extends IGenericRepository<
    Condominium, // T (Entity)
    Prisma.CondominiumWhereInput, // WhereInput
    Prisma.CondominiumWhereUniqueInput, // WhereUniqueInput
    Prisma.CondominiumCreateInput, // CreateInput
    Prisma.CondominiumUpdateInput, // UpdateInput
    Prisma.CondominiumFindManyArgs // FindManyArgs
  > {
  /**
   * Finds a condominium by its unique CNPJ.
   */
  findByCnpj(cnpj: string): Promise<Condominium | null>;
  findByEmail(email: string): Promise<Condominium | null>;
  createWithManager(
    condominiumData: Omit<Prisma.CondominiumCreateInput, 'users'>,
    managerData: { email: string; hashedPassword: string },
  ): Promise<Condominium>;
}
