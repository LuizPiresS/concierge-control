import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { IUseCase } from '../../../../../shared/domain/use-case.interface';
import {
  CONDOMINIUM_REPOSITORY_TOKEN,
  ICondominiumRepository,
} from '../../../domain/repositories/condominium.repository.interface';
import { CondominiumMapper } from '../../mappers/condominium.mapper';
import { UpdateCondominiumResponseDto } from '../../../presentation/http/dtos/update-condominium-response.dto';

type FindAllCondominiumsRequest = {
  // Os tipos aqui podem chegar como string ou boolean
  isActive?: boolean | string;
  isDeleted?: boolean | string;
};

type FindAllCondominiumsResponse = UpdateCondominiumResponseDto[];

@Injectable()
export class FindAllCondominiumsUseCase
  implements IUseCase<FindAllCondominiumsRequest, FindAllCondominiumsResponse>
{
  constructor(
    @Inject(CONDOMINIUM_REPOSITORY_TOKEN)
    private readonly condominiumRepository: ICondominiumRepository,
    private readonly condominiumMapper: CondominiumMapper,
  ) {}

  async execute(
    request: FindAllCondominiumsRequest,
  ): Promise<FindAllCondominiumsResponse> {
    const where: Prisma.CondominiumWhereInput = {};

    console.log(request);

    // CORREÇÃO: Converte explicitamente para boolean antes de usar.
    if (request.isActive !== undefined) {
      // Compara a string 'true' (ignorando maiúsculas/minúsculas) ou o valor booleano.
      where.isActive = String(request.isActive).toLowerCase() === 'true';
    }

    if (request.isDeleted !== undefined) {
      where.isDeleted = String(request.isDeleted).toLowerCase() === 'true';
    }

    const condominiums = await this.condominiumRepository.findMany({ where });

    return this.condominiumMapper.entitiesToResponseDto(condominiums);
  }
}
