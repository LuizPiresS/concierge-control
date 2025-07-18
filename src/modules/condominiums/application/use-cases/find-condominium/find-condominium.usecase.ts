import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Condominium } from '@prisma/client';
import { IUseCase } from '../../../../../shared/domain/use-case.interface';
import {
  CONDOMINIUM_REPOSITORY_TOKEN,
  ICondominiumRepository,
} from '../../../domain/repositories/condominium.repository.interface';
import { CondominiumMapper } from '../../mappers/condominium.mapper';
import { UpdateCondominiumResponseDto } from '../../../presentation/http/dtos/update-condominium-response.dto';

type FindCondominiumRequest = {
  cnpj?: string;
  name?: string;
};

type FindCondominiumResponse = UpdateCondominiumResponseDto;

@Injectable()
export class FindCondominiumUseCase
  implements IUseCase<FindCondominiumRequest, FindCondominiumResponse>
{
  constructor(
    @Inject(CONDOMINIUM_REPOSITORY_TOKEN)
    private readonly condominiumRepository: ICondominiumRepository,
    private readonly condominiumMapper: CondominiumMapper,
  ) {}

  async execute(
    request: FindCondominiumRequest,
  ): Promise<FindCondominiumResponse> {
    const { cnpj, name } = request;

    let condominium: Condominium | null;
    let criteriaForException: string;

    // REATORAÇÃO: A lógica agora usa um fluxo if/else if, que é mais explícito
    // e permite que o TypeScript infira os tipos corretamente.
    if (cnpj) {
      condominium = await this.condominiumRepository.findFirst({ cnpj });
      criteriaForException = `CNPJ ${cnpj}`;
    } else if (name) {
      // Dentro deste bloco, o TypeScript sabe que 'name' é do tipo 'string'.
      condominium = await this.condominiumRepository.findFirst({ name });
      criteriaForException = `nome ${name}`;
    } else {
      // Este bloco só é alcançado se nem 'cnpj' nem 'name' forem fornecidos.
      throw new BadRequestException(
        'É necessário fornecer um critério de busca (CNPJ ou nome).',
      );
    }

    if (!condominium) {
      throw new NotFoundException(
        `Nenhum condomínio encontrado com ${criteriaForException}.`,
      );
    }

    return this.condominiumMapper.entityToResponseDto(condominium);
  }
}
