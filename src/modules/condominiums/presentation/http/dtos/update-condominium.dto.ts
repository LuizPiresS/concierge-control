import { PartialType } from '@nestjs/swagger';
import { CreateCondominiumDto } from './create-condominium.dto';

/**
 * DTO para atualização de um condomínio.
 * Usar PartialType do Swagger (ou do @nestjs/mapped-types) é uma forma elegante
 * de criar um DTO de atualização. Ele torna todos os campos do DTO base
 * (CreateCondominiumDto) opcionais, mas mantém todas as suas validações
 * (ex: @IsEmail, @Length), que serão aplicadas apenas se o campo for fornecido.
 */
export class UpdateCondominiumDto extends PartialType(CreateCondominiumDto) {}
