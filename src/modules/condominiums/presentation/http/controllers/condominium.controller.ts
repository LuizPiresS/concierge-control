import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CondominiumService } from '../../../application/services/condominium.service';
import { UpdateCondominiumDto } from '../dtos/update-condominium.dto';
import { UpdateCondominiumResponseDto } from '../dtos/update-condominium-response.dto';
import { CondominiumMapper } from '../../../application/mappers/condominium.mapper';
import { FindCondominiumQueryDto } from '../dtos/find-condominium-query.dto';
import { CreateCondominiumDto } from '../dtos/create-condominium.dto';

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

  @Get('find')
  @ApiOperation({
    summary: 'Finds a single condominium by CNPJ or name',
    description: 'Provide either a CNPJ or a name as a query parameter.',
  })
  @ApiQuery({ name: 'cnpj', required: false, type: String })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Condominium found successfully.',
    type: UpdateCondominiumResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Missing search criteria.' })
  @ApiResponse({ status: 404, description: 'Condominium not found.' })
  findOneBy(@Query() query: FindCondominiumQueryDto) {
    return this.condominiumService.findOneByCriteria(query);
  }

  @Patch(':id')
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-deletes a condominium by its ID' })
  @ApiResponse({
    status: 204,
    description: 'The condominium was successfully removed.',
  })
  @ApiResponse({ status: 404, description: 'Condominium not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.condominiumService.remove(id);
  }
}
