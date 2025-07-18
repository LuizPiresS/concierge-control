import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUseCase } from '../../../../../shared/domain/use-case.interface';
import {
  CONDOMINIUM_REPOSITORY_TOKEN,
  ICondominiumRepository,
} from '../../../domain/repositories/condominium.repository.interface';

// A entrada é o ID do condomínio (string) e a saída é um booleano indicando sucesso.
type RemoveCondominiumRequest = string;
type RemoveCondominiumResponse = boolean;

@Injectable()
export class RemoveCondominiumUseCase
  implements IUseCase<RemoveCondominiumRequest, RemoveCondominiumResponse>
{
  constructor(
    @Inject(CONDOMINIUM_REPOSITORY_TOKEN)
    private readonly condominiumRepository: ICondominiumRepository,
  ) {}

  /**
   * Executa a lógica de soft-delete para um condomínio.
   * @param id O ID do condomínio a ser removido.
   * @returns `true` se a remoção for bem-sucedida.
   * @throws {NotFoundException} se o condomínio não for encontrado.
   */
  async execute(
    id: RemoveCondominiumRequest,
  ): Promise<RemoveCondominiumResponse> {
    // 1. Primeiro, verifique se o condomínio existe.
    const existingCondominium = await this.condominiumRepository.findByUnique({
      id,
    });

    if (!existingCondominium) {
      throw new NotFoundException(`Condomínio com ID ${id} não encontrado.`);
    }

    // 2. Se existir, execute o soft delete.
    // O método softDelete já define `isDeleted: true` e `isActive: false`.
    await this.condominiumRepository.softDelete({ id });

    // 3. Retorne `true` para indicar que a operação foi concluída.
    return true;
  }
}
