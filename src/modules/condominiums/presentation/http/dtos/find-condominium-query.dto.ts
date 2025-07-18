import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateIf } from 'class-validator';

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

  // Validador customizado para garantir que pelo menos um campo seja preenchido.
  @ValidateIf((o: FindCondominiumQueryDto) => !o.cnpj && !o.name)
  @IsString({
    message: 'Você deve fornecer ao menos um critério de busca (cnpj ou name).',
  })
  // Este campo não existe de fato, é apenas um truque para acionar a validação.
  private readonly criteriaCheck: string;
}
