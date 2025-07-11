export interface IGenericRepository<
  T,
  Where,
  Create,
  Update,
  FindManyArgs = any,
> {
  create(data: Create): Promise<T>;
  findByUnique(where: Where): Promise<T | null>;
  findOne(where: Where): Promise<T | null>;
  findAll(tenantId: string): Promise<T[]>;
  findWithFilters(options: FindManyArgs & { tenantId: string }): Promise<T[]>;
  update(where: Where, data: Update): Promise<T>;
  delete(where: Where): Promise<boolean>;
  softDelete(where: Where): Promise<T>;
  count(where?: Where): Promise<number>;
  exists(where: Where): Promise<boolean>;
  upsert(where: Where, create: Create, update: Update): Promise<T>;
  findMany(options?: FindManyArgs): Promise<T[]>;
  findFirst(where: Where): Promise<T | null>;
  findManyWithPagination(
    page?: number,
    limit?: number,
    where?: Where,
    orderBy?: any,
  ): Promise<{ data: T[]; total: number; page: number; limit: number }>;
}
