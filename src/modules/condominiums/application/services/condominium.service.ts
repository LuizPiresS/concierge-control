import { Injectable } from '@nestjs/common';
import { CreateCondominiumDto } from '../../presentation/http/dtos/create-condominium.dto';
import { CreateCondominiumUseCase } from '../use-cases/create-condominium/create-condominium.usecase';

// Import other use cases here as you create them

@Injectable()
export class CondominiumService {
  constructor(
    private readonly createCondominiumUseCase: CreateCondominiumUseCase,
    // Inject other use cases here
  ) {}

  create(dto: CreateCondominiumDto) {
    return this.createCondominiumUseCase.execute(dto);
  }

  // Create other methods (findAll, findOne, update, remove) that will call their respective use cases.
}
