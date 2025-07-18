import { Inject, Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../../shared/domain/use-case.interface';
import {
  CONDOMINIUM_REPOSITORY_TOKEN,
  ICondominiumRepository,
} from '../../../domain/repositories/condominium.repository.interface';
import { CondominiumMapper } from '../../mappers/condominium.mapper';
import { UpdateCondominiumResponseDto } from '../../../presentation/http/dtos/update-condominium-response.dto';

// O caso de uso não recebe parâmetros (void) e retorna uma lista de DTOs de resposta.
type FindAllCondominiumsResponse = UpdateCondominiumResponseDto[];

@Injectable()
export class FindAllCondominiumsUseCase
  implements IUseCase<void, FindAllCondominiumsResponse>
{
  constructor(
    @Inject(CONDOMINIUM_REPOSITORY_TOKEN)
    private readonly condominiumRepository: ICondominiumRepository,
    private readonly condominiumMapper: CondominiumMapper,
  ) {}

  /**
   * Busca todos os condomínios cadastrados.
   * @returns Uma lista de condomínios formatada como DTO de resposta.
   */
  async execute(): Promise<FindAllCondominiumsResponse> {
    // 1. Busca todas as entidades do repositório.
    const condominiums = await this.condominiumRepository.findMany();

    // 2. Usa o mapper para converter a lista de entidades em uma lista de DTOs seguros.
    //    Isso garante que a resposta da API seja consistente e não exponha dados sensíveis.
    return this.condominiumMapper.entityListToResponseDtoList(condominiums);
  }
}
