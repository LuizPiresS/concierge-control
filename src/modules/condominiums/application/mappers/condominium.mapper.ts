import { Injectable } from '@nestjs/common';
import { Condominium, Prisma } from '@prisma/client';
import { UpdateCondominiumDto } from '../../presentation/http/dtos/update-condominium.dto';
import { UpdateCondominiumResponseDto } from '../../presentation/http/dtos/update-condominium-response.dto';

@Injectable()
export class CondominiumMapper {
  updateDtoToUpdateInput(
    dto: UpdateCondominiumDto,
  ): Prisma.CondominiumUpdateInput {
    const { managerEmail: _managerEmail, ...updateData } = dto;
    return updateData;
  }

  entityToResponseDto(entity: Condominium): UpdateCondominiumResponseDto {
    // CORRECTION: Instantiate the DTO class to ensure the correct type is returned.
    const dto = new UpdateCondominiumResponseDto();
    Object.assign(dto, entity);
    return dto;
  }

  /**
   * Converte uma lista de entidades Condominium em uma lista de DTOs de resposta.
   * @param entities Uma lista de entidades Condominium.
   * @returns Uma lista de DTOs de resposta.
   */
  entitiesToResponseDto(
    entities: Condominium[],
  ): UpdateCondominiumResponseDto[] {
    // This method now correctly returns an array of DTO instances
    // because it calls the fixed entityToResponseDto method.
    return entities.map((entity) => this.entityToResponseDto(entity));
  }
}
