import { Injectable } from '@nestjs/common';
import { CreateCondominiumDto } from '../../presentation/http/dtos/create-condominium.dto';
import { CreateCondominiumUseCase } from '../use-cases/create-condominium/create-condominium.usecase';

@Injectable()
export class CondominiumService {
  constructor(
    private readonly createCondominiumUseCase: CreateCondominiumUseCase,
  ) {}

  create(dto: CreateCondominiumDto) {
    return this.createCondominiumUseCase.execute(dto);
  }
}
