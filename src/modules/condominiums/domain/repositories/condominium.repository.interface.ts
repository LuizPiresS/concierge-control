import { Condominium, Prisma } from '@prisma/client';
import { GenericRepository } from '../../../../infrastructure/database/prisma/repositories/generic-repository/generic.repository';

export const CONDOMINIUM_REPOSITORY_TOKEN = 'CONDOMINIUM_REPOSITORY_TOKEN';

// The interface now implicitly includes all methods from GenericRepository
// and only explicitly defines what is unique to a condominium repository.
export interface ICondominiumRepository
  extends GenericRepository<
    Condominium,
    Prisma.CondominiumWhereUniqueInput,
    Prisma.CondominiumWhereInput,
    Prisma.CondominiumCreateInput,
    Prisma.CondominiumUpdateInput
  > {
  // Only specific method contracts are listed here.
  findByCnpj(cnpj: string): Promise<Condominium | null>;
}
