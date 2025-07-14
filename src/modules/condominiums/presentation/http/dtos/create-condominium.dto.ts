import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCondominiumDto {
  @ApiProperty({
    description: 'The name of the condominium.',
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
  @Length(14, 14)
  cnpj: string;

  @ApiProperty({
    description: 'The full address of the condominium.',
    example: 'Rua das Flores, 123, Bairro Feliz, Cidade Exemplo - SP',
  })
  @IsString()
  @IsNotEmpty()
  address: string;
}
