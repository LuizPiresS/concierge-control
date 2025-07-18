import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, ValidateIf } from 'class-validator';

// Função auxiliar para transformar "true" ou "false" (string) em boolean.
const toBoolean = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return !!value;
};

export class FindCondominiumQueryDto {
  @ApiPropertyOptional({
    description: 'The CNPJ of the condominium to find.',
    example: '12345678000190',
  })
  @IsString()
  @IsOptional()
  cnpj?: string;

  @ApiPropertyOptional({
    description: 'The name of the condominium to find.',
    example: 'Residencial Jardins',
  })
  @IsString()
  @IsOptional()
  name?: string;

  // --- CAMPOS DE FILTRO ADICIONADOS ---
  @ApiPropertyOptional({
    description: 'Filter by active status.',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by deleted status.',
    type: Boolean,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isDeleted?: boolean;

  @ValidateIf((o: FindCondominiumQueryDto) => !o.cnpj && !o.name)
  @IsString({
    message: 'Você deve fornecer ao menos um critério de busca (cnpj ou name).',
  })
  private readonly criteriaCheck: string;
}
