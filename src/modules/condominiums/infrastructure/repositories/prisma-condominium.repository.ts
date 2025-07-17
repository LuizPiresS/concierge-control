import { ConflictException, Injectable } from '@nestjs/common';
import { Condominium, Prisma } from '@prisma/client';
import { GenericRepository } from '../../../../infrastructure/database/prisma/repositories/generic-repository/generic.repository';
import { ICondominiumRepository } from '../../domain/repositories/condominium.repository.interface';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';

@Injectable()
export class PrismaCondominiumRepository
  extends GenericRepository<
    Condominium,
    Prisma.CondominiumWhereInput, // WhereInput
    Prisma.CondominiumWhereUniqueInput, // WhereUniqueInput
    Prisma.CondominiumCreateInput,
    Prisma.CondominiumUpdateInput,
    Prisma.CondominiumFindManyArgs
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

  async findByEmail(email: string): Promise<Condominium | null> {
    return this.findFirst({ email });
  }

  /**
   * Creates a condominium and its initial manager user within a single database transaction.
   * This method now encapsulates the entire creation logic.
   */
  async createWithManager(
    condominiumData: Omit<Prisma.CondominiumCreateInput, 'users'>,
    managerData: { email: string; hashedPassword: string },
  ): Promise<Condominium> {
    return this.prisma.$transaction(async (tx) => {
      // Check if manager user already exists
      const existingUser = await tx.user.findUnique({
        where: { email: managerData.email },
      });
      if (existingUser) {
        throw new ConflictException('Este e-mail de síndico já está em uso.');
      }

      // Create the condominium
      const createdCondo = await tx.condominium.create({
        data: condominiumData,
      });

      // Create the manager user and link it
      await tx.user.create({
        data: {
          email: managerData.email,
          password: managerData.hashedPassword,
          condominiumId: createdCondo.id,
        },
      });

      return createdCondo;
    });
  }
}
