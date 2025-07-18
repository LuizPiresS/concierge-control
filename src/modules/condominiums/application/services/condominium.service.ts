import { Injectable } from '@nestjs/common';
import { Condominium } from '@prisma/client';
import { CreateCondominiumDto } from '../../presentation/http/dtos/create-condominium.dto';
import { UpdateCondominiumDto } from '../../presentation/http/dtos/update-condominium.dto';
import {
  CreateCondominiumResponse,
  CreateCondominiumUseCase,
} from '../use-cases/create-condominium/create-condominium.usecase';
import { FindAllCondominiumsUseCase } from '../use-cases/find-all-condominiums/find-all-condominiums.usecase';
import { FindCondominiumUseCase } from '../use-cases/find-condominium/find-condominium.usecase';
import { RemoveCondominiumUseCase } from '../use-cases/remove-condominium/remove-condominium.usecase';
import { UpdateCondominiumUseCase } from '../use-cases/update-condominium/update-condominium.usecase';
import { UpdateCondominiumResponseDto } from '../../presentation/http/dtos/update-condominium-response.dto';
import { FindAllCondominiumsQueryDto } from '../../presentation/http/dtos/find-all-condominiums-query.dto';
import { FindCondominiumQueryDto } from '../../presentation/http/dtos/find-condominium-query.dto';

@Injectable()
export class CondominiumService {
  constructor(
    private readonly createCondominiumUseCase: CreateCondominiumUseCase,
    private readonly updateCondominiumUseCase: UpdateCondominiumUseCase,
    private readonly findAllCondominiumsUseCase: FindAllCondominiumsUseCase,
    private readonly findCondominiumUseCase: FindCondominiumUseCase,
    private readonly removeCondominiumUseCase: RemoveCondominiumUseCase,
  ) {}

  create(
    createCondominiumDto: CreateCondominiumDto,
  ): Promise<CreateCondominiumResponse> {
    return this.createCondominiumUseCase.execute(createCondominiumDto);
  }

  update(
    id: string,
    updateCondominiumDto: UpdateCondominiumDto,
  ): Promise<Condominium> {
    return this.updateCondominiumUseCase.execute({
      id,
      dto: updateCondominiumDto,
    });
  }

  findAll(
    query: FindAllCondominiumsQueryDto,
  ): Promise<UpdateCondominiumResponseDto[]> {
    return this.findAllCondominiumsUseCase.execute(query);
  }

  findOneByCriteria(
    criteria: FindCondominiumQueryDto,
  ): Promise<UpdateCondominiumResponseDto> {
    return this.findCondominiumUseCase.execute(criteria);
  }

  remove(id: string): Promise<boolean> {
    return this.removeCondominiumUseCase.execute(id);
  }
}
