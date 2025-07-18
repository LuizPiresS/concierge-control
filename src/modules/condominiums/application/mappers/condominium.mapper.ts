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
   */
  entityToResponseDto(entity: Condominium): UpdateCondominiumResponseDto {
    const responseDto = new UpdateCondominiumResponseDto();
    Object.assign(responseDto, entity);
    return responseDto;
  }

  /**
   * Converte uma lista de entidades Condominium em uma lista de DTOs de resposta.
   * @param entities A lista de entidades do banco de dados.
   * @returns Uma lista de DTOs prontos para a resposta da API.
   */
  entityListToResponseDtoList(
    entities: Condominium[],
  ): UpdateCondominiumResponseDto[] {
    return entities.map((entity) => this.entityToResponseDto(entity));
  }
}
