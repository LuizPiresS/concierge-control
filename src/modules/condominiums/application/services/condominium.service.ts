import { Injectable } from '@nestjs/common';
import { Condominium } from '@prisma/client';
import { CreateCondominiumDto } from '../../presentation/http/dtos/create-condominium.dto';
import { UpdateCondominiumDto } from '../../presentation/http/dtos/update-condominium.dto';
import {
  CreateCondominiumResponse,
  CreateCondominiumUseCase,
} from '../use-cases/create-condominium/create-condominium.usecase';
// --- 1. Importe o novo caso de uso ---
import { FindAllCondominiumsUseCase } from '../use-cases/find-all-condominiums/find-all-condominiums.usecase';
import { UpdateCondominiumUseCase } from '../use-cases/update-condominium/update-condominium.usecase';
import { UpdateCondominiumResponseDto } from '../../presentation/http/dtos/update-condominium-response.dto';

@Injectable()
export class CondominiumService {
  constructor(
    private readonly createCondominiumUseCase: CreateCondominiumUseCase,
    private readonly updateCondominiumUseCase: UpdateCondominiumUseCase,
    // --- 2. Injete o novo caso de uso ---
    private readonly findAllCondominiumsUseCase: FindAllCondominiumsUseCase,
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

  // --- 3. Implemente o método de listagem, delegando para o caso de uso ---
  findAll(): Promise<UpdateCondominiumResponseDto[]> {
    return this.findAllCondominiumsUseCase.execute();
  }
}
