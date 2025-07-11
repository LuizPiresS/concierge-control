import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'O endereço de e-mail único do usuário.',
    example: 'joao.silva@example.com',
  })
  @IsEmail({}, { message: 'Por favor, forneça um email válido.' })
  @IsNotEmpty({ message: 'O email não pode estar vazio.' })
  email: string;

  @ApiProperty({
    description: 'A senha do usuário, com no mínimo 6 caracteres.',
    example: 'S3nh@F0rt3',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  password: string;
}
