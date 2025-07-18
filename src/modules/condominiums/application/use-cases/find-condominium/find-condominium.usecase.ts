import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
  isActive?: boolean;
  isDeleted?: boolean;
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
    const { cnpj, name, isActive, isDeleted } = request;

    if (!cnpj && !name) {
      throw new BadRequestException(
        'É necessário fornecer um critério de busca (CNPJ ou nome).',
      );
    }

    const where: Prisma.CondominiumWhereInput = {};
    let criteriaForException: string;

    if (cnpj) {
      where.cnpj = cnpj;
      criteriaForException = `CNPJ ${cnpj}`;
    } else if (name) {
      where.name = name;
      criteriaForException = `nome ${name}`;
    } else {
      throw new BadRequestException('Critério de busca inválido.');
    }

    // Adiciona os filtros de status à query
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (isDeleted !== undefined) {
      where.isDeleted = isDeleted;
    }

    const condominium = await this.condominiumRepository.findFirst(where);

    if (!condominium) {
      throw new NotFoundException(
        `Nenhum condomínio encontrado com os critérios fornecidos: ${criteriaForException}.`,
      );
    }

    return this.condominiumMapper.entityToResponseDto(condominium);
  }
}
