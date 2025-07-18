import {
  ConflictException,
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
import { UpdateCondominiumDto } from '../../../presentation/http/dtos/update-condominium.dto';
import { CondominiumMapper } from '../../mappers/condominium.mapper';

// Tipos para a requisição e resposta do caso de uso
type UpdateCondominiumRequest = {
  id: string;
  dto: UpdateCondominiumDto;
};
type UpdateCondominiumResponse = Condominium;

@Injectable()
export class UpdateCondominiumUseCase
  implements IUseCase<UpdateCondominiumRequest, UpdateCondominiumResponse>
{
  constructor(
    @Inject(CONDOMINIUM_REPOSITORY_TOKEN)
    private readonly condominiumRepository: ICondominiumRepository,
    private readonly condominiumMapper: CondominiumMapper,
  ) {}

  async execute(
    request: UpdateCondominiumRequest,
  ): Promise<UpdateCondominiumResponse> {
    const { id, dto } = request;

    // 1. Garante que o condomínio que se deseja atualizar realmente existe.
    const existingCondominium = await this.condominiumRepository.findByUnique({
      id,
    });
    if (!existingCondominium) {
      throw new NotFoundException(`Condomínio com ID ${id} não encontrado.`);
    }

    // 2. Validações de conflito para campos únicos (CNPJ e E-mail)
    if (dto.cnpj) {
      const conflictByCnpj = await this.condominiumRepository.findByCnpj(
        dto.cnpj,
      );
      // Se encontrou um condomínio com o mesmo CNPJ e o ID é diferente do atual, é um conflito.
      if (conflictByCnpj && conflictByCnpj.id !== id) {
        throw new ConflictException('Já existe um condomínio com este CNPJ.');
      }
    }

    if (dto.email) {
      const conflictByEmail = await this.condominiumRepository.findByEmail(
        dto.email,
      );
      if (conflictByEmail && conflictByEmail.id !== id) {
        throw new ConflictException(
          'Já existe um condomínio com este e-mail de contato.',
        );
      }
    }

    // 3. Mapeia o DTO para o formato de atualização do Prisma.
    const dataToUpdate = this.condominiumMapper.updateDtoToUpdateInput(dto);

    // 4. Executa a atualização no banco de dados.
    const updatedCondominium = await this.condominiumRepository.update(
      { id },
      dataToUpdate,
    );

    return updatedCondominium;
  }
}
