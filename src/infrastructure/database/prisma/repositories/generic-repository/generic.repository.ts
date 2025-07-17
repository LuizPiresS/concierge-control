/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

interface IBaseEntity {
  id: string;
  isActive: boolean;
  isDeleted: boolean;
}

@Injectable()
export abstract class GenericRepository<
  T extends IBaseEntity,
  WhereInput, // e.g., Prisma.CondominiumWhereInput
  WhereUniqueInput, // e.g., Prisma.CondominiumWhereUniqueInput
  CreateInput, // e.g., Prisma.CondominiumCreateInput
  UpdateInput, // e.g., Prisma.CondominiumUpdateInput
  FindManyArgs extends { orderBy?: any } = Prisma.Args<T, 'findMany'>,
> {
  protected constructor(protected readonly prisma: PrismaClient) {}

  protected abstract getModel(): any;

  async create(data: CreateInput): Promise<T> {
    return this.getModel().create({ data });
  }

  async findByUnique(where: WhereUniqueInput): Promise<T | null> {
    return this.getModel().findUnique({ where });
  }

  async update(where: WhereUniqueInput, data: UpdateInput): Promise<T> {
    return this.getModel().update({ where, data });
  }

  async delete(where: WhereUniqueInput): Promise<boolean> {
    try {
      await this.getModel().delete({ where });
      return true;
    } catch (error) {
      // Verificação de erro mais segura e específica do Prisma.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return false; // "Record to delete does not exist."
      }
      throw error;
    }
  }

  /**
   * CORRIGIDO: Este método agora está alinhado com o seu `schema.prisma`,
   * que usa `isDeleted: Boolean` em vez de `deletedAt`.
   */
  async softDelete(where: WhereUniqueInput): Promise<T> {
    const data: Partial<IBaseEntity> = {
      isDeleted: true,
      isActive: false,
    };
    return this.getModel().update({ where, data });
  }

  async findFirst(where: WhereInput): Promise<T | null> {
    return this.getModel().findFirst({ where });
  }

  async findMany(options?: FindManyArgs): Promise<T[]> {
    return this.getModel().findMany(options);
  }

  async count(where?: WhereInput): Promise<number> {
    return this.getModel().count({ where });
  }

  async exists(where: WhereInput): Promise<boolean> {
    const count = await this.getModel().count({ where });
    return count > 0;
  }

  async findManyWithPagination(
    page = 1,
    limit = 10,
    where?: WhereInput,
    orderBy?: FindManyArgs['orderBy'],
  ): Promise<{ data: T[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    // Usar $transaction é mais seguro que Promise.all para consistência de dados.
    const [data, total] = await this.prisma.$transaction([
      this.getModel().findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.getModel().count({ where }),
    ]);

    return { data, total, page, limit };
  }
}
