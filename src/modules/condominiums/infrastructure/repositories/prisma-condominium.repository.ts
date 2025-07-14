import { Injectable } from '@nestjs/common';
import { Condominium, Prisma } from '@prisma/client';
import { GenericRepository } from '../../../../infrastructure/database/prisma/repositories/generic-repository/generic.repository';
import { ICondominiumRepository } from '../../domain/repositories/condominium.repository.interface';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';

@Injectable()
export class PrismaCondominiumRepository
  extends GenericRepository<
    Condominium,
    Prisma.CondominiumWhereUniqueInput,
    Prisma.CondominiumWhereInput,
    Prisma.CondominiumCreateInput,
    Prisma.CondominiumUpdateInput
  >
  implements ICondominiumRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected getModel() {
    return this.prisma.condominium;
  }

  /**
   * Finds a condominium by its unique CNPJ.
   * This is a specific method that justifies its place here.
   */
  async findByCnpj(cnpj: string): Promise<Condominium | null> {
    // Uses the inherited 'findFirst' for the query.
    return this.findFirst({ cnpj });
  }
}
