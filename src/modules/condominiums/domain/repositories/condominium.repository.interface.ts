import { Condominium, Prisma } from '@prisma/client';

/**
 * O token de injeção é um Symbol, garantindo que seja único na aplicação.
 * Este é o único local onde este token deve ser definido.
 */
export const CONDOMINIUM_REPOSITORY_TOKEN = Symbol('ICondominiumRepository');

/**
 * A interface define o contrato que a implementação do repositório
 * (camada de infraestrutura) deve seguir.
 */
export interface ICondominiumRepository {
  create(data: Prisma.CondominiumCreateInput): Promise<Condominium>;
  findByCnpj(cnpj: string): Promise<Condominium | null>;
}
