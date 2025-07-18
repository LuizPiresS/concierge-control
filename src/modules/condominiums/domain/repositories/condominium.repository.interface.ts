import { Condominium, Prisma } from '@prisma/client';
import { IGenericRepository } from '../../../../infrastructure/database/prisma/repositories/generic-repository/interfaces/generic-repository.interface';

export const CONDOMINIUM_REPOSITORY_TOKEN = Symbol('ICondominiumRepository');

export interface ICondominiumRepository
  extends IGenericRepository<
    Condominium,
    Prisma.CondominiumWhereInput,
    Prisma.CondominiumWhereUniqueInput,
    Prisma.CondominiumCreateInput,
    Prisma.CondominiumUpdateInput
  > {
  findByCnpj(cnpj: string): Promise<Condominium | null>;
  findByEmail(email: string): Promise<Condominium | null>;
  createWithManager(
    condominiumData: Omit<Prisma.CondominiumCreateInput, 'users'>,
    managerData: { email: string; hashedPassword: string },
  ): Promise<Condominium>;
}
