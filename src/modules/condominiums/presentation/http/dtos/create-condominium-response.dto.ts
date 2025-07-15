import { ApiProperty } from '@nestjs/swagger';

// Uma classe para representar a entidade Condominium na resposta do Swagger.
// Isso evita expor a entidade do Prisma diretamente e nos dá controle sobre a documentação.
export class CondominiumInResponse {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  id: string;

  @ApiProperty({ example: 'Residencial Jardins' })
  name: string;

  @ApiProperty({ example: '12345678000190' })
  cnpj: string;

  @ApiProperty({ example: 'Rua das Flores' })
  street: string;

  @ApiProperty({ example: '123' })
  number: string;

  @ApiProperty({ example: 'Bairro Feliz' })
  neighborhood: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CreateCondominiumResponseDto {
  @ApiProperty({ type: () => CondominiumInResponse })
  condominium: CondominiumInResponse;

  @ApiProperty({
    description:
      "The initial manager's temporary password. This is only shown once upon creation and must be stored securely.",
    example: 'aB1!cDe2$fGh',
  })
  managerInitialPassword: string;
}
