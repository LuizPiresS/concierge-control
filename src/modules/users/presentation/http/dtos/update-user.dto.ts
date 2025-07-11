import { PartialType } from '@nestjs/swagger'; // Importe de @nestjs/swagger
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
