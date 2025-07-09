import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
