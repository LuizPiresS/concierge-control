import { Injectable } from '@nestjs/common';
import { Condominium } from '@prisma/client';
import { CreateCondominiumDto } from '../../presentation/http/dtos/create-condominium.dto';
import { UpdateCondominiumDto } from '../../presentation/http/dtos/update-condominium.dto';
import {
  CreateCondominiumResponse,
  CreateCondominiumUseCase,
} from '../use-cases/create-condominium/create-condominium.usecase';
import { FindAllCondominiumsUseCase } from '../use-cases/find-all-condominiums/find-all-condominiums.usecase';
// --- 1. Importe o novo caso de uso ---
import { FindCondominiumUseCase } from '../use-cases/find-condominium/find-condominium.usecase';
import { UpdateCondominiumUseCase } from '../use-cases/update-condominium/update-condominium.usecase';
import { UpdateCondominiumResponseDto } from '../../presentation/http/dtos/update-condominium-response.dto';

@Injectable()
export class CondominiumService {
  constructor(
    private readonly createCondominiumUseCase: CreateCondominiumUseCase,
    private readonly updateCondominiumUseCase: UpdateCondominiumUseCase,
    private readonly findAllCondominiumsUseCase: FindAllCondominiumsUseCase,
    // --- 2. Injete o novo caso de uso ---
    private readonly findCondominiumUseCase: FindCondominiumUseCase,
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

  findAll(): Promise<UpdateCondominiumResponseDto[]> {
    return this.findAllCondominiumsUseCase.execute();
  }

  // --- 3. Implemente o novo método de busca ---
  findOneByCriteria(criteria: {
    cnpj?: string;
    name?: string;
  }): Promise<UpdateCondominiumResponseDto> {
    return this.findCondominiumUseCase.execute(criteria);
  }
}
