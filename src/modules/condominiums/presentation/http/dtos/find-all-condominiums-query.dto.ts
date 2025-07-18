import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

// Função auxiliar para transformar "true" ou "false" (string) em boolean.
const toBoolean = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return !!value;
};

export class FindAllCondominiumsQueryDto {
  @ApiPropertyOptional({
    description: 'Filtra por condomínios ativos ou inativos.',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filtra por condomínios removidos (soft-deleted) ou não.',
    type: Boolean,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isDeleted?: boolean;
}
