import { Injectable } from '@nestjs/common';
import { Condominium, Prisma } from '@prisma/client';
import { UpdateCondominiumDto } from '../../presentation/http/dtos/update-condominium.dto';
import { UpdateCondominiumResponseDto } from '../../presentation/http/dtos/update-condominium-response.dto';

@Injectable()
export class CondominiumMapper {
  /**
   * Converte um UpdateCondominiumDto para o formato de entrada de atualização do Prisma.
   */
  updateDtoToUpdateInput(
    dto: UpdateCondominiumDto,
  ): Prisma.CondominiumUpdateInput {
    const { managerEmail: _managerEmail, ...dataToUpdate } = dto;
    return dataToUpdate;
  }

  /**
   * Converte uma entidade Condominium para o DTO de resposta da API.
   * Garante que a resposta da API siga um contrato definido e não exponha
   * detalhes internos da entidade.
   * @param entity A entidade Condominium vinda do banco de dados.
   * @returns Um objeto UpdateCondominiumResponseDto.
   */
  entityToResponseDto(entity: Condominium): UpdateCondominiumResponseDto {
    // Como o DTO de resposta já tem a estrutura correta, podemos simplesmente
    // criar uma nova instância a partir da entidade para garantir a tipagem.
    // Se o DTO fosse diferente da entidade, aqui seria o lugar para mapear
    // campo por campo.
    const responseDto = new UpdateCondominiumResponseDto();
    Object.assign(responseDto, entity);
    return responseDto;
  }
}
