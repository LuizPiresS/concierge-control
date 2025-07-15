import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { UsersModule } from './modules/users/users.module';
import { CondominiumsModule } from './modules/condominiums/condominium.module';

@Module({
  imports: [SharedModule, UsersModule, CondominiumsModule],
})
export class AppModule {}
