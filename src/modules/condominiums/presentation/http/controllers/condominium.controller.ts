import {
  Body,
  Controller,
  Get,
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

  // --- 2.  listar todos os condomínios ---
  @Get()
  @ApiOperation({ summary: 'Lists all condominiums' })
  @ApiResponse({
    status: 200,
    description: 'List of condominiums returned successfully.',
    type: [UpdateCondominiumResponseDto],
  })
  findAll() {
    return this.condominiumService.findAll();
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
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCondominiumDto: UpdateCondominiumDto,
  ): Promise<UpdateCondominiumResponseDto> {
    const updatedCondominium = await this.condominiumService.update(
      id,
      updateCondominiumDto,
    );

    return this.condominiumMapper.entityToResponseDto(updatedCondominium);
  }
}
