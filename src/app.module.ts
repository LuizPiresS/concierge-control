import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { CondominiumModule } from './modules/condominiums/condominium.module';

@Module({
  imports: [PrismaModule, UsersModule, CondominiumModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
