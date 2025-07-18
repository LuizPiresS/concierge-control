import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CondominiumService } from '../../../application/services/condominium.service';
import { CreateCondominiumResponseDto } from '../dtos/create-condominium-response.dto';
import { CreateCondominiumDto } from '../dtos/create-condominium.dto';
import { UpdateCondominiumDto } from '../dtos/update-condominium.dto';
import { UpdateCondominiumResponseDto } from '../dtos/update-condominium-response.dto';
import { CondominiumMapper } from '../../../application/mappers/condominium.mapper';

@ApiTags('condominiums')
@Controller('condominiums')
export class CondominiumController {
  constructor(
    private readonly condominiumService: CondominiumService,
    private readonly condominiumMapper: CondominiumMapper,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Creates a new condominium' })
  @ApiResponse({
    status: 201,
    type: CreateCondominiumResponseDto,
    description: 'The condominium was created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters.' })
  @ApiResponse({
    status: 409,
    description: 'A condominium with this CNPJ already exists.',
  })
  create(@Body() createCondominiumDto: CreateCondominiumDto) {
    return this.condominiumService.create(createCondominiumDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Updates an existing condominium' })
  @ApiResponse({
    status: 200,
    description: 'The condominium was updated successfully.',
    type: UpdateCondominiumResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Condominium not found.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict with existing data (e.g., CNPJ).',
  })
  // 2. O método agora é 'async' e o tipo de retorno é o DTO de resposta.
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCondominiumDto: UpdateCondominiumDto,
  ): Promise<UpdateCondominiumResponseDto> {
    // 3. Chamamos o serviço para obter a entidade atualizada do banco.
    const updatedCondominium = await this.condominiumService.update(
      id,
      updateCondominiumDto,
    );

    // 4. Usa o mapper para converter a entidade em um DTO de resposta antes de retornar.
    return this.condominiumMapper.entityToResponseDto(updatedCondominium);
  }
}
