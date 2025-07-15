import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateCondominiumDto {
  @ApiProperty({
    description: 'The trade name of the condominium.',
    example: 'Residencial Jardins',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description:
      'The CNPJ of the condominium (Brazilian company registration number), containing only numbers.',
    example: '12345678000190',
    minLength: 14,
    maxLength: 14,
  })
  @IsString()
  @IsNotEmpty()
  @Length(14, 14, { message: 'O CNPJ deve ter exatamente 14 caracteres.' })
  cnpj: string;

  // --- Manager User Information (New Required Field) ---
  @ApiProperty({
    description:
      "The email address for the condominium's initial manager (síndico). This user will be created automatically.",
    example: 'sindico.jardins@example.com',
  })
  @IsEmail(
    {},
    { message: 'Por favor, forneça um email válido para o síndico.' },
  )
  @IsNotEmpty({ message: 'O email do síndico não pode estar vazio.' })
  managerEmail: string;

  // --- Detailed Address ---
  @ApiProperty({
    description: 'The street name of the condominium address.',
    example: 'Rua das Flores',
  })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({
    description: 'The number of the condominium address.',
    example: '123',
  })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiPropertyOptional({
    description: 'Additional address information (e.g., block, suite, floor).',
    example: 'Bloco C, Apto 101',
  })
  @IsString()
  @IsOptional()
  complement?: string;

  @ApiProperty({
    description: 'The neighborhood of the condominium address.',
    example: 'Bairro Feliz',
  })
  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @ApiProperty({
    description: 'The city of the condominium address.',
    example: 'Cidade Exemplo',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'The state (UF) of the condominium address.',
    example: 'SP',
    minLength: 2,
    maxLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 2, { message: 'O estado (UF) deve ter exatamente 2 caracteres.' })
  state: string;

  @ApiProperty({
    description:
      'The ZIP code of the condominium address, containing only numbers.',
    example: '12345678',
    minLength: 8,
    maxLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 8, { message: 'O CEP deve ter exatamente 8 caracteres.' })
  zipCode: string;

  // --- Contact Information ---
  @ApiPropertyOptional({
    description: 'The main contact phone number for the condominium.',
    example: '11987654321',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'The main contact email for the condominium.',
    example: 'contato@residencialjardins.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  // --- Tax Information ---
  @ApiPropertyOptional({
    description: 'The state registration number (Inscrição Estadual).',
    example: '111.222.333.444',
  })
  @IsString()
  @IsOptional()
  stateRegistration?: string;

  @ApiPropertyOptional({
    description: 'The municipal registration number (Inscrição Municipal).',
    example: '555666777',
  })
  @IsString()
  @IsOptional()
  municipalRegistration?: string;

  // --- Other ---
  @ApiPropertyOptional({
    description: 'A URL for the condominium logo.',
    example: 'https://example.com/logo.png',
  })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;
}
