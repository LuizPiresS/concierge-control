import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Condominium } from '@prisma/client';
import { IUseCase } from '../../../../../shared/domain/use-case.interface';
import {
  CONDOMINIUM_REPOSITORY_TOKEN,
  ICondominiumRepository,
} from '../../../domain/repositories/condominium.repository.interface';
import { CreateCondominiumDto } from '../../../presentation/http/dtos/create-condominium.dto';

type Request = CreateCondominiumDto;
type Response = Condominium;

@Injectable()
export class CreateCondominiumUseCase implements IUseCase<Request, Response> {
  constructor(
    @Inject(CONDOMINIUM_REPOSITORY_TOKEN)
    private readonly condominiumRepository: ICondominiumRepository,
  ) {}

  async execute(request: Request): Promise<Response> {
    const existingCondominium = await this.condominiumRepository.findByCnpj(
      request.cnpj,
    );

    if (existingCondominium) {
      throw new ConflictException(
        'A condominium with this CNPJ already exists.',
      );
    }

    return this.condominiumRepository.create(request);
  }
}
