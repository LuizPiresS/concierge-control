import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Condominium } from '@prisma/client';

/**
 * DTO para a resposta da criação ou atualização de um condomínio.
 * Implementa a entidade Condominium para garantir que o contrato da API
 * seja um reflexo fiel e seguro do modelo de dados.
 */
export class UpdateCondominiumResponseDto implements Condominium {
  @ApiProperty({ description: 'The unique identifier of the condominium.' })
  id: string;

  @ApiProperty({ description: 'The trade name of the condominium.' })
  name: string;

  @ApiProperty({ description: 'The CNPJ of the condominium.' })
  cnpj: string;

  @ApiProperty({ description: 'The street name of the condominium address.' })
  street: string;

  @ApiProperty({ description: 'The number of the condominium address.' })
  number: string;

  @ApiPropertyOptional({ description: 'Additional address information.' })
  complement: string | null;

  @ApiProperty({ description: 'The neighborhood of the condominium address.' })
  neighborhood: string;

  @ApiProperty({ description: 'The city of the condominium address.' })
  city: string;

  @ApiProperty({ description: 'The state (UF) of the condominium address.' })
  state: string;

  @ApiProperty({ description: 'The ZIP code of the condominium address.' })
  zipCode: string;

  @ApiPropertyOptional({ description: 'The main contact phone number.' })
  phone: string | null;

  @ApiPropertyOptional({ description: 'The main contact email.' })
  email: string | null;

  @ApiPropertyOptional({ description: 'The state registration number.' })
  stateRegistration: string | null;

  @ApiPropertyOptional({ description: 'The municipal registration number.' })
  municipalRegistration: string | null;

  @ApiPropertyOptional({ description: 'A URL for the condominium logo.' })
  logoUrl: string | null;

  @ApiProperty({ description: 'Indicates if the condominium is active.' })
  isActive: boolean;

  @ApiProperty({ description: 'Indicates if the condominium is soft-deleted.' })
  isDeleted: boolean;

  @ApiProperty({ description: 'The creation timestamp of the condominium.' })
  createdAt: Date;

  @ApiProperty({ description: 'The last update timestamp of the condominium.' })
  updatedAt: Date;
}
