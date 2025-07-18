import { Injectable } from '@nestjs/common';
import { Condominium } from '@prisma/client';
import { CreateCondominiumDto } from '../../presentation/http/dtos/create-condominium.dto';
import { UpdateCondominiumDto } from '../../presentation/http/dtos/update-condominium.dto';
import {
  CreateCondominiumResponse,
  CreateCondominiumUseCase,
} from '../use-cases/create-condominium/create-condominium.usecase';
import { UpdateCondominiumUseCase } from '../use-cases/update-condominium/update-condominium.usecase';

@Injectable()
export class CondominiumService {
  constructor(
    private readonly createCondominiumUseCase: CreateCondominiumUseCase,
    // 1. Injete o caso de uso de atualização
    private readonly updateCondominiumUseCase: UpdateCondominiumUseCase,
  ) {}

  create(dto: CreateCondominiumDto): Promise<CreateCondominiumResponse> {
    return this.createCondominiumUseCase.execute(dto);
  }

  // 2. Implemente o método de atualização, delegando para o caso de uso
  update(id: string, dto: UpdateCondominiumDto): Promise<Condominium> {
    return this.updateCondominiumUseCase.execute({
      id,
      dto,
    });
  }
}
