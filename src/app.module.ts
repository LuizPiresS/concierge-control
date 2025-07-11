import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
